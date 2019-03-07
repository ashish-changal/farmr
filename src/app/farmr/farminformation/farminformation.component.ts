import { Component, OnInit } from '@angular/core';
import { FarmrService } from '../services/farmr.service';
import { AuthService } from '../../auth/auth.service';
import { FileUpload } from '../fileupload';
import { AddFarmDetails } from '../../models/addfarmdetails.model';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-farminformation',
  templateUrl: './farminformation.component.html',
  styleUrls: ['./farminformation.component.css']
})
export class FarminformationComponent implements OnInit {
  selectedFiles: any = [];
  validCities: any = [];
  progress: { percentage: number } = { percentage: 0 }
  currentFileUpload: FileUpload;
  uid: any;
  disableDropzoneMarket: boolean = false;
  response: string = "";
  responseClass: string = "";
  toggle = true;
  existFarm = [];
  defaultFarm = [];
  newfarm: AddFarmDetails = <AddFarmDetails>{};
  farm = null;
  existResponse: string = "";
  originalData: AddFarmDetails = <AddFarmDetails>{};
  _sub: any;
  autoCityValues = [];
  autoDropCityValues = [];
  invalidCity:boolean = false;
  invalidDropZoneCity:boolean = false;
  hours = [
    ('0:00'), ('1:00'), ('2:00'), ('3:00'), ('4:00'), ('5:00'), ('6:00'),
    ('7:00'), ('8:00'), ('9:00'), ('10:00'), ('11:00'), ('12:00'),
    ('13:00'), ('14:00'), ('15:00'), ('16:00'), ('17:00'), ('18:00'),
    ('19:00'), ('20:00'), ('21:00'), ('22:00'), ('23:00'), ('24:00'),
    ('closed')
  ];

  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'), ('DE'), ('FL'), ('GA'),
    ('HI'), ('ID'), ('IL'), ('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'), ('MD'),
    ('MA'), ('MI'), ('MN'), ('MS'), ('MO'), ('MT'), ('NE'), ('NV'), ('NH'), ('NJ'),
    ('NM'), ('NY'), ('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'), ('RI'), ('SC'),
    ('SD'), ('TN'), ('TX'), ('UT'), ('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'), ('WY')

  ];

  cityNames = [];
  constructor(public farmrService: FarmrService, public authService: AuthService,
    public parent: FarmrComponent, public sharedService: SharedService, public spinner: NgxSpinnerService) { }

  ngOnInit() {

    this.parent.pageTitle = "Farm Information";
    this.authService.checkLogin().subscribe(uid => {
      this.uid = uid;
      if(this.sharedService.cityNames.length == 0){
        this.sharedService.getCitiesName();
      }
      this.farmrService.getFarm(uid).then(res => {
        if (res.length > 0) {
          this.farm = true;
          this.newfarm.name = res[0]['name'];
          this.newfarm.city = res[0]['city'];
          this.newfarm.marketname = res[0].marketname ? res[0].marketname : ""
          this.newfarm.streetdropzone1 = res[0].streetdropzone1 ? res[0].streetdropzone1 : ""
          this.newfarm.streetdropzone2 = res[0].streetdropzone2 ? res[0].streetdropzone2 : ""
          this.newfarm.citydropzone = res[0].citydropzone ? res[0].citydropzone : ""
          this.newfarm.statedropzone = res[0].statedropzone ? res[0].statedropzone : ""
          this.newfarm.zipcodedropzone = res[0].zipcodedropzone ? res[0].zipcodedropzone : ""
          this.newfarm.zipcode = res[0]['zipcode'];
          this.newfarm.phonenumber = '(' + res[0].phonenumber.substring(0, 3) + ') ' + res[0].phonenumber.substring(3, 6) + '-' + res[0].phonenumber.substring(6, 10);
          this.newfarm.state = res[0]['state'];
          this.newfarm.farmaddress1 = res[0]['farmaddress1'];
          this.newfarm.farmaddress2 = res[0]['farmaddress2'];
          this.newfarm.website = res[0]['website'];
          this.newfarm.farmruid = res[0]['farmruid'];
          this.newfarm.image = res[0]['image'];
          this.newfarm.farmtype = res[0]['farmtype'];
          this.newfarm.pickup = res[0]['pickupOption'] ? res[0]['pickupOption'] : "";
          this.newfarm.deliverytime = res[0]['deliverytime'];
          var monday = res[0]['schedulehours']['monday'];
          var tuesday = res[0]['schedulehours']['tuesday'];
          var wednesday = res[0]['schedulehours']['wednesday'];
          var thursday = res[0]['schedulehours']['thursday'];
          var firday = res[0]['schedulehours']['friday'];
          var saturday = res[0]['schedulehours']['saturday'];
          var sunday = res[0]['schedulehours']['sunday'];
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
          this.newfarm.hdn = res[0].key;
          this.newfarm.farmdesc = res[0].farmdesc
          this.originalData = Object.assign({}, this.newfarm);
        } else {
          this.farm = false;
        }
        this.getAllFarms();
      })
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('farminformation');
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
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

  showFarm() {
    this.farm = true;
    this.newfarm.image = './assets/imgs/upload.png';
    this.newfarm.farmtype = "";
    this.newfarm.pickup = "";
    this.newfarm.monOpening = "";
    this.newfarm.monClosing = "";
    this.newfarm.tuesOpening = "";
    this.newfarm.tuesClosing = "";
    this.newfarm.wedOpening = "";
    this.newfarm.wedClosing = "";
    this.newfarm.thusOpening = "";
    this.newfarm.thusClosing = "";
    this.newfarm.friOpening = "";
    this.newfarm.friClosing = "";
    this.newfarm.satOpening = "";
    this.newfarm.satClosing = "";
    this.newfarm.sunOpening = "";
    this.newfarm.sunClosing = "";
    this.newfarm.marketname = "";
    this.newfarm.streetdropzone1 = "";
    this.newfarm.streetdropzone2 = "";
    this.newfarm.citydropzone = "";
    this.newfarm.statedropzone = "";
    this.newfarm.zipcodedropzone = "";
    this.newfarm.farmaddress2 = "";
    this.newfarm.website = "";
    this.enableEditing();
  }

  cancel() {
    this.toggle = !this.toggle;
    this.newfarm = Object.assign({}, this.originalData);
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    var reader = new FileReader();
    reader.onload = (event: any) => {
      this.newfarm.image = event.target.result;
    }
    reader.readAsDataURL(event.target.files[0]);
  }

  getAllFarms() {
    this._sub = this.farmrService.getAllFarm().subscribe((farms) => {
      this.defaultFarm = [];
      farms.forEach((farm: any) => {
        if (this.newfarm.name != farm.name) {
          this.defaultFarm.push(farm.name);
        }
      })
    })
  }

  addFarm(farmkey) {
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
    this.newfarm.farmruid = this.uid;
    if(this.newfarm.pickup == 'farm'){
      this.newfarm.marketname = null;
      this.newfarm.citydropzone = null;
      this.newfarm.statedropzone = null;
      this.newfarm.streetdropzone1 = null;
      this.newfarm.streetdropzone2 = null;
      this.newfarm.zipcodedropzone = null;
    }
    let cityname = this.sharedService.cityNames.filter((item) => {
      return item.toLowerCase() == this.newfarm.city.toLowerCase();
    })
    let dropcityname = [];
    if(this.newfarm.citydropzone){
      dropcityname = this.sharedService.cityNames.filter((item) => {
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
      if (farmkey != undefined && farmkey != null && farmkey != "") {
        this.update(this.newfarm);
      }
      else {
        this.upload(this.newfarm);
      }
    }
  }

  update(newfarm) {
    this.spinner.show();

    if (this.selectedFiles.length == 0) {
      this.farmrService.updatewithoutimagefarm(this.newfarm).then((res) => {
        this.spinner.hide();
        if (res) {
          this.originalData = Object.assign({}, this.newfarm);
          this.toggle = true;
        } else {
          this.responseClass = "response-failed";
          this.response = "Some problem in updation";
        }
      })
    }
    else {
      const file = this.selectedFiles.item(0);
      this.currentFileUpload = new FileUpload(file);
      this.farmrService.updatefarm(this.currentFileUpload, this.newfarm).then((res) => {
        this.spinner.hide();
        if (res) {
          this.toggle = true;
        } else {
          this.responseClass = "response-failed";
          this.response = "Some problem in updation";
        }
      })
    }
  }
  _keyPress(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;

  }
  upload(newfarm) {
    this.spinner.show();
    const file = this.selectedFiles.item(0);
    this.currentFileUpload = new FileUpload(file);
    this.farmrService.addFarm(this.currentFileUpload, this.newfarm).then((response) => {
      this.spinner.hide();
      if (response) {
        this.sharedService.childAddedEvent({ action: 'farm', key: response })
        this.toggle = true;
      }
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
        this.autoCityValues = this.sharedService.cityNames.filter((item) => {
          return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
        })
      } else {
        this.autoCityValues = [];
      }
    } else {
      if (val && val.trim() != "") {
        this.autoDropCityValues = this.sharedService.cityNames.filter((item) => {
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
