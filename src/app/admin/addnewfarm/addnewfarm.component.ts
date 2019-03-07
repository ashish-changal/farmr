import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { AddFarmDetails } from '../../models/addfarmdetails.model';
import { ServiceService } from '../service.service';
import { FileUpload } from '../fileupload';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminComponent } from '../admin.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-addnewfarm',
  templateUrl: './addnewfarm.component.html',
  styleUrls: ['./addnewfarm.component.css']
})
export class AddnewfarmComponent implements OnInit {

  selectedFiles: any = [];
  responseClass: string;
  response: string = "";
  toggle = true;
  disableDropzoneMarket: boolean = false;
  farmernames = [];
  _sub: any = [];
  farmKey: any;
  originalData: AddFarmDetails = <AddFarmDetails>{};
  users = [];
  defaultFarm = [];
  existResponse: string = "";
  farmStatus: string = "";
  farmr: any = {};
  autoCityValues = [];
  autoDropCityValues = [];
  cityNames = [];
  invalidCity:boolean = false;
  invalidDropZoneCity:boolean = false;
  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'), ('DE'), ('FL'), ('GA'),
    ('HI'), ('ID'), ('IL'), ('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'), ('MD'),
    ('MA'), ('MI'), ('MN'), ('MS'), ('MO'), ('MT'), ('NE'), ('NV'), ('NH'), ('NJ'),
    ('NM'), ('NY'), ('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'), ('RI'), ('SC'),
    ('SD'), ('TN'), ('TX'), ('UT'), ('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'), ('WY')

  ];
  newfarm: AddFarmDetails = <AddFarmDetails>{};
  currentFileUpload: FileUpload
  hours = [
    ('0:00'), ('1:00'), ('2:00'), ('3:00'), ('4:00'), ('5:00'), ('6:00'),
    ('7:00'), ('8:00'), ('9:00'), ('10:00'), ('11:00'), ('12:00'),
    ('13:00'), ('14:00'), ('15:00'), ('16:00'), ('17:00'), ('18:00'),
    ('19:00'), ('20:00'), ('21:00'), ('22:00'), ('23:00'), ('24:00'),
    ('closed')
  ];
  constructor(public sharedServices: SharedService, public services: ServiceService,
    public activatedRoute: ActivatedRoute, public router: Router, public parent: AdminComponent,
    public spinner: NgxSpinnerService, public authService: AuthService) { }

  ngOnInit() {
    this.farmKey = this.activatedRoute.snapshot.paramMap.get('farmKey');

    if(this.sharedServices.cityNames.length == 0){
      this.sharedServices.getCitiesName();
    }
    let sub = this.services.getUsers().subscribe(res => {
      if (res) {
        this.users = [];
        for (let i = 0; i < res.length; i++) {
          if (res[i].usertype == 'farmer') {
            let data = {};
            data['firstname'] = res[i].firstname;
            data['lastname'] = res[i].lastname;
            data['uid'] = res[i].key;
            this.users.push(data);
          }
        }
      }
      this._sub.push(sub);
    })
    this.editFarm(this.farmKey);
    this.getAllFarms();
  }
  ngOnDestroy() {
    this._sub.forEach((sub) => {
      sub.unsubscribe();
    })
  }

  _keyPress(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.parent.pageTitle = "Add/Edit Farm"
      this.sharedServices.setSearchBox(false);
      this.sharedServices.setProduceButtonValue(false);
      this.sharedServices.selectSidemenu("allfarms");
    })
  }
  selectFile(event) {
    this.selectedFiles = event.target.files;
    var reader = new FileReader();

    reader.onload = (event: any) => {
      this.newfarm.image = event.target.result;
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  clearFarmKey() {
    this.sharedServices.setClearData(true);
  }
  addFarm(farmId) {
    this.invalidCity = false;
    this.invalidDropZoneCity = false;
    let hours = {
      "monday": this.newfarm.monOpening != 'closed' ? this.newfarm.monOpening + '-' + this.newfarm.monClosing : 'closed',
      "tuesday": this.newfarm.tuesOpening != 'closed' ? this.newfarm.tuesOpening + '-' + this.newfarm.tuesClosing : 'closed',
      "wednesday": this.newfarm.wedOpening != 'closed' ? this.newfarm.wedOpening + '-' + this.newfarm.wedClosing : 'closed',
      "thursday": this.newfarm.thusOpening != 'closed' ? this.newfarm.thusOpening + '-' + this.newfarm.thusClosing : 'closed',
      "friday": this.newfarm.friOpening != 'closed' ? this.newfarm.friOpening + '-' + this.newfarm.friClosing : 'closed',
      "saturday": this.newfarm.satOpening != 'closed' ? this.newfarm.satOpening + '-' + this.newfarm.satClosing : 'closed',
      "sunday": this.newfarm.sunOpening != 'closed' ? this.newfarm.sunOpening + '-' + this.newfarm.sunClosing : 'closed'
    }
    this.newfarm['hours'] = hours;
    if(this.newfarm.pickup == 'farm'){
      this.newfarm.marketname = null;
      this.newfarm.citydropzone = null;
      this.newfarm.statedropzone = null;
      this.newfarm.streetdropzone1 = null;
      this.newfarm.streetdropzone2 = null;
      this.newfarm.zipcodedropzone = null;
    }
    let cityname = this.sharedServices.cityNames.filter((item) => {
      return item.toLowerCase() == this.newfarm.city.toLowerCase();
    })
    let dropcityname = [];
    if(this.newfarm.citydropzone){
      dropcityname = this.sharedServices.cityNames.filter((item) => {
        return item.toLowerCase() == this.newfarm.citydropzone.toLowerCase();
      })
    }
    if (cityname.length == 0) {
      this.invalidCity = true;
      this.spinner.hide();
    }
    if (this.newfarm.citydropzone != null && this.newfarm.citydropzone != undefined && dropcityname.length == 0) {
      this.invalidDropZoneCity = true;
      this.spinner.hide();
    } 
    if(!this.invalidCity && !this.invalidDropZoneCity) {
      if (farmId != undefined && farmId != null && farmId != "") {
        this.update();
      }
      else {
        if(this.newfarm.farmruid){
          this.services.getFarmKey(this.newfarm.farmruid).then((res) => {
            if (res.length > 0) {
              this.responseClass = 'response-failed';
              this.response = "A farm is already associated with this farmer please select another farmer";
            } else {
              this.upload();
            }
          })
        }else{
          this.responseClass = 'response-failed';
          this.response = "Please associate any farmr with this farm";
        }
      }
    }
  }

  update() {
    this.spinner.show();
    if (this.selectedFiles.length == 0) {
      this.services.updatewithoutimage(this.newfarm).then((res) => {
        this.spinner.hide();
        if (res) {
          if (this.farmStatus != "" && this.farmStatus != this.newfarm.status) {
            if (this.newfarm.status == 'pending' || this.newfarm.status == 'rejected') {
              let data = { 'receiver': this.farmr.email, 'subject': 'Your farm, ' + this.newfarm.name + ' status has been changed.', 'message': "Dear " + this.farmr.firstname + " " + this.farmr.lastname + ",\n\n Sorry! Your farm, " + this.newfarm.name + " status has been changed from " + this.farmStatus + " to " + this.newfarm.status + " . Please contact the system admin for further details.", };
              this.authService.sendMail(data);
              this.services.getPendingOrdersWithInactiveFarm(this.farmKey, this.newfarm.name);
              this.services.sendNotification([{
                'message': "Sorry! Your farm, " + this.newfarm.name + " status has been changed from " + this.farmStatus + " to " + this.newfarm.status + " . Please contact the system admin for further details.",
                'key': this.newfarm.hdn
              }])
            } else {
              let data = { 'receiver': this.farmr.email, 'subject': 'Farm Approved', 'message': "Dear " + this.farmr.firstname + " " + this.farmr.lastname + ",\n\n Congratulations! Your request to sell fresh farm produce has been approved. You may proceed to add your produce inventory for sale." };
              this.authService.sendMail(data);
              this.services.sendNotification([{
                'message': "Congratulations! " + this.newfarm.name + " has been approved to sell produce using Farmr",
                'key': this.newfarm.hdn
              }])
            }
          }
          this.router.navigate(['admin/farms']);
        }
      })
    } 
    else {
      const file = this.selectedFiles.item(0);
      this.currentFileUpload = new FileUpload(file);
      this.services.updatefarm(this.currentFileUpload, this.newfarm).then((res) => {
        this.spinner.hide();
        if (res) {
          if (this.farmStatus != "" && this.farmStatus != this.newfarm.status) {
            if (this.farmStatus == 'pending' || this.farmStatus == 'rejected') {
              let data = { 'receiver': this.farmr.email, 'subject': 'Your farm, ' + this.newfarm.name + ' status has been changed.', 'message': "Dear " + this.farmr.firstname + " " + this.farmr.lastname + ",\n\n Sorry! Your farm, " + this.newfarm.name + " status has been changed from " + this.farmStatus + " to " + this.newfarm.status + " . Please contact the system admin for further details.", };
              this.authService.sendMail(data);
              this.services.getPendingOrdersWithInactiveFarm(this.farmKey, this.newfarm.name);
              this.services.sendNotification([{
                'message': "Sorry! Your farm, " + this.newfarm.name + " status has been changed from " + this.farmStatus + " to " + this.newfarm.status + " . Please contact the system admin for further details.",
                'key': this.newfarm.hdn
              }])
            } else {
              let data = { 'receiver': this.farmr.email, 'subject': 'Farm Approved', 'message': "Dear " + this.farmr.firstname + " " + this.farmr.lastname + ",\n\n Congratulations! Your request to sell fresh farm produce has been approved. You may proceed to add your produce inventory for sale." };
              this.authService.sendMail(data);
              this.services.sendNotification([{
                'message': "Congratulations! " + this.newfarm.name + " has been approved to sell produce using Farmr",
                'key': this.newfarm.hdn
              }])
            }
          }
          this.router.navigate(['admin/farms']);
        }
      })
    }
  }

  cancel() {
    if (this.farmKey == 0) {
      this.router.navigate(['admin/farms']);
    }
    else {
      this.toggle = !this.toggle;
      this.newfarm = Object.assign({}, this.originalData);
    }

  }

  upload() {
    this.spinner.show();
    const file = this.selectedFiles.item(0)
    this.currentFileUpload = new FileUpload(file);
    this.services.addNewFarm(this.currentFileUpload, this.newfarm).then((farmKey) => {
      this.spinner.hide();
      if (farmKey) {
        this.sharedServices.childAddedEvent({ action: 'farm', key: farmKey })
        this.router.navigate(['admin/farms']);
      }
    })
  }
  pickupOption(event): void {

    const newVal = event.target.value;
    if (newVal == "farm") {
      this.disableDropzoneMarket = true;
    }
    else {
      this.disableDropzoneMarket = false;
    }
  }

  editFarm(farmKey) {

    this.emptyvalue();
    if (farmKey != 0) {

      this.services.editFarm(farmKey).then(res => {
        if (res && res.length > 0) {
          if (res[0]['pickupOption'] == "farm") {
            this.disableDropzoneMarket = true;
          }
          else {
            this.disableDropzoneMarket = false;
          }
          this.newfarm.name = res[0]['name'];
          this.newfarm.city = res[0]['city'];
          // this.newfarm.dropzone = res[0]['dropzone'];
          this.newfarm.marketname = res[0]['marketname'] ? res[0]['marketname'] : "";
          this.newfarm.streetdropzone1 = res[0]['streetdropzone1'] ? res[0]['streetdropzone1'] : "";
          this.newfarm.streetdropzone2 = res[0]['streetdropzone2'] ? res[0]['streetdropzone2'] : "";
          this.newfarm.citydropzone = res[0]['citydropzone'] ? res[0]['citydropzone'] : "";
          this.newfarm.statedropzone = res[0]['statedropzone'] ? res[0]['statedropzone'] : "";
          this.newfarm.zipcodedropzone = res[0]['zipcodedropzone'] ? res[0]['zipcodedropzone'] : "";
          this.newfarm.zipcode = res[0]['zipcode'];
          this.newfarm.phonenumber = '(' + res[0]['phonenumber'].substr(0, 3) + ') ' + res[0]['phonenumber'].substr(3, 3) + '-' + res[0]['phonenumber'].substr(6, 4);
          this.newfarm.state = res[0]['state'];
          this.newfarm.farmaddress1 = res[0]['farmaddress1'];
          this.newfarm.farmaddress2 = res[0]['farmaddress2'] ? res[0]['farmaddress2'] : "";
          this.newfarm.website = res[0]['website'] ? res[0]['website'] : "";
          this.newfarm.farmruid = res[0]['farmruid'];
          this.newfarm.farmdesc = res[0]['farmdesc']
          this.newfarm.farmtype = res[0]['farmtype'];
          this.newfarm.pickup = res[0]['pickupOption'] ? res[0]['pickupOption'] : "";
          this.newfarm.deliverytime = res[0]['deliverytime'];
          this.newfarm.image = res[0]['image'];
          this.newfarm.status = res[0]['status'];
          this.farmStatus = res[0]['status'];
          var monday = ((res[0]['schedulehours']['monday']));
          var tuesday = ((res[0]['schedulehours']['tuesday']));
          var wednesday = ((res[0]['schedulehours']['wednesday']));
          var thursday = ((res[0]['schedulehours']['thursday']));
          var firday = ((res[0]['schedulehours']['friday']));
          var saturday = ((res[0]['schedulehours']['saturday']));
          var sunday = ((res[0]['schedulehours']['sunday']));
          var mondayhour = monday.split("-");
          var tuesdayhour = tuesday.split("-");
          var wednesdayhour = wednesday.split("-");
          var thursdayhour = thursday.split("-");
          var fridayhour = firday.split("-");
          var saturdayhour = saturday.split("-");
          var sundayhour = sunday.split("-");
          this.newfarm.monOpening = mondayhour[0];
          this.newfarm.monClosing = mondayhour[0] != 'closed' ? mondayhour[1] : 'closed';
          this.newfarm.tuesOpening = tuesdayhour[0];
          this.newfarm.tuesClosing = tuesdayhour[0] != 'closed' ? tuesdayhour[1] : 'closed';
          this.newfarm.wedOpening = wednesdayhour[0];
          this.newfarm.wedClosing = wednesdayhour[0] != 'closed' ? wednesdayhour[1] : 'closed';
          this.newfarm.thusOpening = thursdayhour[0];
          this.newfarm.thusClosing = thursdayhour[0] != 'closed' ? thursdayhour[1] : 'closed';
          this.newfarm.friOpening = fridayhour[0];
          this.newfarm.friClosing = fridayhour[0] != 'closed' ? fridayhour[1] : 'closed';
          this.newfarm.satOpening = saturdayhour[0];
          this.newfarm.satClosing = saturdayhour[0] != 'closed' ? saturdayhour[1] : 'closed';
          this.newfarm.sunOpening = sundayhour[0];
          this.newfarm.sunClosing = sundayhour[0] != 'closed' ? sundayhour[1] : 'closed';
          this.newfarm.hdn = farmKey;
          this.originalData = Object.assign({}, this.newfarm);
          this.authService.getUserInformation(this.newfarm.farmruid).then((user) => {
            this.farmr = user[0];
          })
        }
      })
    }
    else {
      this.enableEditing();
    }
  }

  emptyvalue() {
    this.newfarm = <AddFarmDetails>{};
    this.newfarm.image = './assets/imgs/upload.png';
    this.newfarm.marketname = "";
    this.newfarm.streetdropzone1 = "";
    this.newfarm.streetdropzone2 = "";
    this.newfarm.citydropzone = "";
    this.newfarm.statedropzone = "";
    this.newfarm.zipcodedropzone = "";
    this.newfarm.farmaddress2 = "";
    this.newfarm.website = "";
  }
  getAllFarms() {
    let sub = this.services.getFarms().subscribe((farms) => {
      this.defaultFarm = [];
      farms.forEach((farm: any) => {
        if (this.newfarm.name != farm.name) {
          this.defaultFarm.push(farm.name);
        }
      })
      this._sub.push(sub);
    })
  }
  checkFarmExist(val) {
    if (val && val.trim() != "") {
      let value = this.defaultFarm.filter((item) => {
        return (item.toLowerCase() == val.toLowerCase());
      })
      if (value.length == 1) {
        this.existResponse = "Farm name alredy exist";
      }
      else {
        this.existResponse = "";
      }
    }
  }
  enableEditing() {
    this.toggle = !this.toggle;
  }
  autoComplete(val, field) {
    this.autoCityValues = [];
    this.autoDropCityValues = [];
    if (field == 'city') {
      if (val && val.trim() != "") {
        this.autoCityValues = this.sharedServices.cityNames.filter((item) => {
          return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
        })
      } else {
        this.autoCityValues = [];
      }
    } else {
      if (val && val.trim() != "") {
        this.autoDropCityValues = this.sharedServices.cityNames.filter((item) => {
          return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
        })
      } else {
        this.autoDropCityValues = [];
      }
    }
  }
  setDefault(field){
    if (field == 'city') {
      this.invalidCity = false;
    } else {
      this.invalidDropZoneCity = false;
    }
  }
  selectItem(value, field) {
    this.autoCityValues = [];
    this.autoDropCityValues = [];
    if (field == 'city') {
      this.newfarm.city = value;
    } else {
      this.newfarm.citydropzone = value;
    }
  }
}
