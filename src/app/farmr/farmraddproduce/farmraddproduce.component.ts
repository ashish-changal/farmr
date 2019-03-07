import { Component, OnInit, ViewChild } from '@angular/core';
import { FileUpload } from '../fileupload';
import { AuthService } from '../../auth/auth.service';
import { FarmrService } from '../services/farmr.service';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { AddProduce } from '../../models/addproduce.model';
import { LoggerService } from '../../logger.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

@Component({
  selector: 'app-farmraddproduce',
  templateUrl: './farmraddproduce.component.html',
  styleUrls: ['./farmraddproduce.component.css']
})
export class FarmraddproduceComponent implements OnInit {
  @ViewChild('myFile') myInputVariable: any;
  selectedFiles: any = [];
  currentFileUpload: FileUpload;
  farmkey: any;
  p: any = 1;
  value: string;
  produces = [];
  disable = true;
  produceKey: any;
  produce: AddProduce = <AddProduce>{};
  defaultProduce = [];
  autocompleteValues = [];
  units = [
    'oz', 'lb', 'ct', 'qt', 'gal', 'bunch', 'liter', 'doz', 'jar', 'basket', 'kgs'
  ];
  response: string = "";
  responseClass: string = "";
  noDataFound: string = 'Fetching data...';
  itemsForSearch = [];
  farmName:string;
  _sub: any;
  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    editableDateField: false,
    openSelectorOnInputClick: true,
    dateFormat: 'mm-dd-yyyy'
  };
  constructor(public authService: AuthService, public farmrService: FarmrService,
    public parent: FarmrComponent, public sharedService: SharedService,
    public loggerService: LoggerService, public activatedRoute: ActivatedRoute,
    public router: Router) {
    let currDate = this.sharedService.getDatewithTimezone();
    this.myDatePickerOptions.disableUntil = { year: currDate.getFullYear(), month: currDate.getMonth() + 1, day: currDate.getDate() }
  }

  ngOnInit() {
    this.produceKey = this.activatedRoute.snapshot.paramMap.get('produceKey');
    this.produce.unit = 'lb';
    this.response = "";
    this.selectedFiles = [];
    this.produce.image = './assets/imgs/grey.png';
    this.farmrService.getDefaultProduce().then((produce) => {
      this.defaultProduce = produce;
      this.defaultProduce.sort((a, b) => {
        if (a.name > b.name) return 1
        else if (a.name < b.name) return -1
        else return 0
      })
    })
    this.authService.checkLogin().subscribe(uid => {
      this.produce['uid'] = uid;
      this._sub = this.farmrService.getAllProduce(uid).subscribe(res => {
        if (res.length > 0) {
          this.farmName = res[0].name;
          this.disable = false;
          this.produces = [];
          for (let i = 0; i < res.length; i++) {
            let stock = res[i]['stock'];
            this.farmkey = res[i]['key'];
            if (stock != undefined) {
              Object.keys(stock).map((key, index) => {
                this.produces.push(stock[key].productname);
              })
            } else {
              this.noDataFound = "No Produce found please add them.";
            }

            this.itemsForSearch = this.produces;
          }
        } else {
          this.noDataFound = "No Farm is found please add a farm first";
        }
      });
      this.farmrService.getFarmKey(uid).then((farmKey) => {
        this.farmkey = farmKey;
        this.editFarmProduce(this.produceKey, farmKey);
      })
    })
  }

  ngOnDestroy(){
    if(this._sub != undefined){
      this._sub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('produce');
      this.parent.pageTitle = "Add/Edit Produce"
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }
  _keyPress(event: any) {
    var key = event.keyCode ? event.keyCode : event.which;
    if (key > 45 && key < 58) {
        return true;
    }else if(key == 37 || event.key == "ArrowRight" || key==8 || key==46 || key==9){
      return true;
    }else{
      return false;
    } 
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    var reader = new FileReader();

    reader.onload = (event: any) => {
      this.produce.image = event.target.result;
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  autoComplete(val) {
    this.autocompleteValues = [];
    if (val && val.trim() != "") {
      this.autocompleteValues = this.defaultProduce.filter((item) => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) == 0;
      })
    } else {
      this.autocompleteValues = [];
    }
  }

  checkProduceExist(val) {
    this.responseClass = "";
    this.response = "";
    if (val && val.trim() != "") {
      let value = this.produces.filter((item) => {
        return (item.toLowerCase() == val.toLowerCase());
      })
      if (value.length == 1) {
        this.responseClass = "response-failed";
        this.response = val + " has already been added to the system. You can't add it again";
        setTimeout(() => {
          this.response = "";
        }, 5000)
      }
      else {
        this.responseClass = "";
        this.response = "";
      }
    }
  }
  selectItem(produce: any) {
    this.produce = Object.assign({}, produce);
    this.checkProduceExist(produce.name);
    this.autocompleteValues = [];
  }


  addProduce(producekey) {
    let value = this.produces.filter((item) => {
      return (item.toLowerCase() == this.produce.name.toLowerCase());
    })

    if (value.length == 0) {
      if (producekey != "" && producekey != undefined && producekey != null) {
        this.update(producekey);
      }
      else {
        if (this.selectedFiles.length != 0) {
          this.upload();
        }
      }
    } else {
      this.responseClass = "response-failed";
      this.response = value + " alerady Exist you can add up more units for this Produce";
      setTimeout(() => {
        this.response = "";
      }, 5000)
    }
  }
  cancel() {
    this.router.navigate(['farmr/produce'])
  }
  update(producekey) {
    if (this.selectedFiles.length == 0) {
      this.farmrService.updatewithoutimage(this.produce, producekey, this.farmkey).then(() => {
        this.responseClass = "response-success";
        this.response = "Produce updated successfully";
        setTimeout(() => {
          this.response = "";
          this.router.navigate(['farmr/produce'])
        }, 5000)
      })
    }
    else {
      const file = this.selectedFiles.item(0);
      this.currentFileUpload = new FileUpload(file);
      this.farmrService.updateproduce(this.currentFileUpload, this.produce, producekey, this.farmkey)
        .then((res) => {
          this.responseClass = "response-success";
          this.response = "Produce updated successfuly";
          setTimeout(() => {
            this.response = "";
            this.router.navigate(['farmr/produce'])
          }, 5000)
        }).catch((err) => {
          this.responseClass = "response-failed";
          this.response = "Some problem in updating please try again later";
          setTimeout(() => {
            this.response = "";
          }, 5000);
          this.loggerService.log(err);
        })
    }
  }
  upload() {

    if (this.selectedFiles.length > 0) {
      const file = this.selectedFiles.item(0)
      this.currentFileUpload = new FileUpload(file);
    }
    this.farmrService.addProduce(this.currentFileUpload, this.produce, this.farmkey).then((res) => {
      this.farmrService.sendFCMNotification({
        type: "topic",
        title: "Farmr",
        body: "New produce added to farm "+this.farmName,
        topicName: this.farmkey
      })
      this.responseClass = "response-success";
      this.response = "Produce added successfully";

      setTimeout(() => {
        this.response = "";
        this.router.navigate(['farmr/produce'])

      }, 3000)
    }).catch((err) => {
      this.responseClass = "response-failed";
      this.response = "Some problem in adding please try again later";
      setTimeout(() => {
        this.response = "";
      }, 3000);
      this.loggerService.log(err);
    })

  }
  editFarmProduce(producekey, farmKey) {
    if (producekey != 0) {
      this.farmrService.editProduce(producekey, farmKey).valueChanges().
        take(1).subscribe((res) => {

          let date = new Date(res[0]['scheduled']);
          let currDate = this.sharedService.getDatewithTimezone();
          var unitDesc = res[0]['productdesc'];
          var unitDescSplit = unitDesc.split(" ");
          this.produce.name = res[0]['productname'];
          this.produce.unitquant = unitDescSplit[0];
          this.produce.unit = unitDescSplit[1];
          this.produce.quantity = res[0]['totalquantity'];
          this.produce.price = res[0]['productprice'];
          this.produce.image = res[0]['image'] != " " && res[0]['image'] ? res[0]['image'] : './assets/imgs/grey.png';
          this.produce.lowinventory = res[0]['lowinventory'] != null ? res[0]['lowinventory'] : 0;
          //this.produce.scheduled = res[0]['scheduled'] != null ? res[0]['scheduled'] : '';
          this.produce.hdn = producekey;
          this.produce.scheduled = { formatted: currDate.getTime() <= date.getTime() ? res[0]['scheduled'] : '' };
          let index = this.produces.indexOf(this.produce.name);
          this.produces.splice(index, 1);
        })
    }
  }
}