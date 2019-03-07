import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FarmrService } from '../services/farmr.service';
import { FileUpload } from '../fileupload';
import { AddProduce } from '../../models/addproduce.model';
import { IMyDpOptions } from 'mydatepicker';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { LoggerService } from '../../logger.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

declare var jQuery: any;
@Component({
  selector: 'app-farmrproduce',
  templateUrl: './farmrproduce.component.html',
  styleUrls: ['./farmrproduce.component.css']
})
export class FarmrproduceComponent implements OnInit {

  @ViewChild('myFile') myInputVariable: any;
  selectedFiles: any = [];
  currentFileUpload: FileUpload;
  farmkey: any;
  p: any = 1;
  value: string;
  produces = [];
  disable = true;
  produce: AddProduce = <AddProduce>{};
  defaultProduce = [];
  autocompleteValues = [];
  units = [
    'oz', 'lb', 'ct', 'qt', 'gal', 'bunch', 'liter', 'doz', 'jar', 'basket', 'kgs'
  ];
  autocomplete: string = "";
  autocompleteClass: string = "";
  produceName: string = "";
  produceToBeDelete: string = "";
  produceImage: string = "";
  response: string = "";
  responseClass: string = "";
  noDataFound: string = "";
  itemsForSearch = [];
  _sub: any;
  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'mm-dd-yyyy'
  };
  constructor(public authService: AuthService, public farmrService: FarmrService,
    public parent: FarmrComponent, public sharedService: SharedService,
    public loggerService: LoggerService, public router: Router, public spinner: NgxSpinnerService) {
    let currDate = this.sharedService.getDatewithTimezone();
    this.myDatePickerOptions.disableUntil = { year: currDate.getFullYear(), month: currDate.getMonth() + 1, day: currDate.getDate() }
  }

  ngOnInit() {

    // this.noDataFound = "Fetching data...";
    this.spinner.show();

    this.parent.pageTitle = "Produce";
    this.produce.unit = 'lb';
    this.farmrService.getDefaultProduce().then((produce) => {
      this.defaultProduce = produce;
      this.defaultProduce.sort((a, b) => {
        if (a.name > b.name) return 1
        else if (a.name < b.name) return -1
        else return 0
      })

    })

    this.authService.checkLogin().subscribe(uid => {

      this._sub = this.farmrService.getAllProduce(uid).subscribe(res => {

        if (res.length > 0) {
          setTimeout(() => {
            this.sharedService.selectSidemenu('produce');
            this.sharedService.setProduceButtonValue(true);
          })
          this.spinner.hide()
          this.disable = false;
          this.produces = [];
          for (let i = 0; i < res.length; i++) {
            let stock = res[i]['stock'];
            this.farmkey = res[i]['key'];
            if (stock != undefined) {

              Object.keys(stock).map((key, index) => {
                let desc = stock[key].productdesc;
                let unitDesc = desc.split(" ")[1];
                let produce = {
                  producekey: key,
                  producename: stock[key].productname,
                  availableQuantity: +stock[key].totalquantity,
                  availableQuantityDisp: `${stock[key].totalquantity} ${unitDesc}`,
                  lowinventory: +stock[key].lowinventory,
                  lowinventoryDisp: stock[key].lowinventory != null ? `${stock[key].lowinventory} ${unitDesc}` : `0 ${unitDesc}`,
                  scheduled: stock[key].scheduled != null ? stock[key].scheduled : 'yyyy-mm-dd',
                  image: stock[key].image != " " ? stock[key].image : './assets/imgs/grey.png',
                }
                this.produces.push(produce);
              })
            } else {
              this.noDataFound = "No produce has been added for sale yet. You can add by clicking 'Add Produce' button";
            }
            this.produces = this.produces.sort((a, b) => {
              if (a.producename > b.producename) return 1
              else if (a.producename < b.producename) return -1
              else return 0
            })
            this.itemsForSearch = this.produces;
          }
        } else {
          this.spinner.hide();
          setTimeout(() => {
            this.sharedService.selectSidemenu('produce');
            this.sharedService.setProduceButtonValue(false);
          })
          this.noDataFound = "No Farm is found please add a farm first";
        }
      });
      this.sharedService.currentSearch.subscribe(res => {
        let val: any = res;
        this.produces = this.itemsForSearch;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
          this.produces = this.produces.filter((item) => {
            return (item.producename.toLowerCase().indexOf(val.toLowerCase()) > -1)
          })
          if (this.produces.length == 0) {
            this.noDataFound = "No records found";
          }
        }
      })
    })

    this.sharedService.clearObjectdata.subscribe((res) => {
      if (res) {
        this.emptyvalue();
      }
    })

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('produce');
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Produce Name");
    })
  }
  ngOnDestroy() {
    this._sub.unsubscribe();
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

    if (val && val.trim() != "") {
      let value = this.produces.filter((item) => {
        return item.producename.toLowerCase().indexOf(val.toLowerCase()) == 0;
      })

      if (value.length > 0) {
        this.autocompleteClass = "response-success";
        this.autocomplete = "Produce alerady Exist you can add up more units for this Produce";
        setTimeout(() => {
          this.autocomplete = "";
        }, 5000)
      }
      else {
        this.autocompleteClass = "";
        this.autocomplete = "";
        setTimeout(() => {
          this.autocomplete = "";
        }, 5000)
      }
    }
  }
  selectItem(produce: any) {
    this.produce = Object.assign({}, produce);
    this.autocompleteValues = [];
  }

  addProduce(producekey) {
    this.emptyvalue();
    if (producekey != "" && producekey != undefined && producekey != null) {
      this.update(producekey);
    }
    else {
      if (this.selectedFiles.length != 0) {
        this.upload();
      }
    }
  }
  deleteProduce(produceKey, name, image) {
    if (produceKey) {
      this.produceToBeDelete = produceKey;
      this.produceName = name;
      this.produceImage = image;
      jQuery("#removeProduce").modal("show")
    }
  }
  removeProduce() {
    this.farmrService.deleteProduce(this.produceToBeDelete, this.farmkey).then(()=>{
      this.farmrService.deleteProduceFromWishlist(this.produceToBeDelete, this.farmkey);
    })
  }

  search(val: any) {
    this.sharedService.changeMessage(val);
  }

  update(producekey) {
    if (this.selectedFiles.length == 0) {
      this.farmrService.updatewithoutimage(this.produce, producekey, this.farmkey).then(() => {
        this.responseClass = "response-success";
        this.response = "Produce updated successfuly";
        this.router.navigate(['farmr/produce']);
        setTimeout(() => {
          this.response = "";
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
          this.router.navigate(['farmr/produce']);
          setTimeout(() => {
            this.response = "";
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
    jQuery("#basicModal").modal("hide");

  }
  upload() {
    if (this.selectedFiles.length > 0) {
      const file = this.selectedFiles.item(0)
      this.currentFileUpload = new FileUpload(file);
    }
    this.farmrService.addProduce(this.currentFileUpload, this.produce, this.farmkey).then((res) => {
      this.responseClass = "response-success";
      this.response = "Produce added successfuly";
      this.router.navigate(['farmr/produce']);
      setTimeout(() => {
        this.response = "";
      }, 5000)
    }).catch((err) => {
      this.responseClass = "response-failed";
      this.response = "Some problem in adding please try again later";
      setTimeout(() => {
        this.response = "";
      }, 5000);
      this.loggerService.log(err);
    })
    jQuery("#basicModal").modal("hide");
  }

  emptyvalue() {
    this.myInputVariable.nativeElement.value = "";
    this.produce = <AddProduce>{};
    this.produce.unit = 'lb';
    this.autocomplete = "";
    this.selectedFiles = [];
    this.produce.image = './assets/imgs/grey.png';
    this.authService.checkLogin().subscribe(res => {
      this.produce['uid'] = res;
    });
    this.autocompleteValues = [];
  };

  editFarmProduce(produceKey) {
    this.router.navigate(['farmr/produce/addproduce', produceKey]);
  }
}


