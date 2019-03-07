import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FarmrDetail } from '../../models/FarmrDetail';
import { FarmrService } from '../services/farmr.service';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-farmrsettings',
  templateUrl: './farmrsettings.component.html',
  styleUrls: ['./farmrsettings.component.css']
})
export class FarmrsettingsComponent implements OnInit {
  farmr: FarmrDetail = <FarmrDetail>{};
  oldEmail;
  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'), ('DE'), ('FL'), ('GA'),
    ('ID'), ('IL'), ('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'), ('MD'), ('MA'),
    ('MI'), ('MN'), ('MS'), ('MO'), ('MT'), ('NE'), ('NV'), ('NH'), ('NJ'), ('NM'),
    ('NY'), ('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'), ('RI'), ('SC'), ('SD'),
    ('TN'), ('TX'), ('UT'), ('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'), ('WY')

  ];
  isAuthenticate: boolean = false;
  response: string = "";
  responseClass: string = "";
  invalidFarmrCity: boolean = false;
  autoCityValues = [];
  constructor(public authService: AuthService, public farmrService: FarmrService,
    public parent: FarmrComponent, public sharedService: SharedService,
    public spinner: NgxSpinnerService, public router: Router) { }

  ngOnInit() {

    this.parent.pageTitle = "Settings";
    this.authService.getUserAuthData().take(1).subscribe((authRes) => {
      if (authRes) {
        if (this.sharedService.cityNames.length == 0) {
          this.sharedService.getCitiesName();
        }
        this.authService.getUserInformation(authRes.uid).then((userData) => {
          this.farmr.password = "";
          this.farmr.uid = authRes.uid;
          this.farmr.email = authRes.email;
          this.oldEmail = authRes.email;
          this.farmr.firstname = userData[0].firstname;
          this.farmr.lastname = userData[0].lastname;
          this.farmr.zipcode = userData[0].zipcode;
          this.farmr.state = userData[0].state;
          this.farmr.city = userData[0].city;
          this.farmr.streetaddress1 = userData[0].streetaddress1;
          this.farmr.streetaddress2 = userData[0].streetaddress2;
          this.farmr.phonenumber = '(' + userData[0].phonenumber.substring(0, 3) + ') ' + userData[0].phonenumber.substring(3, 6) + '-' + userData[0].phonenumber.substring(6, 10);
          this.farmr.farmKey = userData[0].key;

        })
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('settings');
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }
  updateFarmr() {
    let cityname = this.sharedService.cityNames.filter((item) => {
      return item.toLowerCase() == this.farmr.city.toLowerCase();
    })
    if (cityname.length == 0) {
      this.invalidFarmrCity = true;
    } else {
      this.spinner.show();
      if (this.farmr.email === this.oldEmail) {
        this.farmrService.updateFarmr(this.farmr).then(() => {
          if (this.farmr.password === '') {
            this.responseClass = "response-success";
            this.response = "Your information has been updated successfully";
            setTimeout(() => {
              this.response = "";
              this.router.navigate(['farmr/dashboard']);
            }, 3000)
            this.spinner.hide();
          } else {
            this.authService.updateUserPassword(this.farmr.password).then((res) => {
              if (res.status) {
                this.responseClass = "response-success";
                this.response = "Your information has been updated successfully";
                setTimeout(() => {
                  this.response = "";
                  this.router.navigate(['farmr/dashboard']);
                }, 3000)
                this.spinner.hide();
              } else {
                this.responseClass = "response-failed";
                this.response = res.message;
                setTimeout(() => {
                  this.response = "";
                }, 3000)
                this.spinner.hide();
              }
            })
          }
        })
      }
    }
  }
  authenticate() {
    this.spinner.show();
    this.authService.reAuthenticate(this.farmr).then((res) => {
      this.spinner.hide();
      if (res.status) {
        this.isAuthenticate = true;
      } else {
        this.responseClass = 'response-failed';
        this.response = res.message;
        setTimeout(() => {
          this.response = "";
        }, 5000)
      }
    })
  }
  _keyPress(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;

  }
  cancel(settingForm: NgForm) {
    settingForm.reset();
    this.isAuthenticate = false;
  }
  autoComplete(val) {
    this.autoCityValues = [];
    if (val && val.trim() != "") {
      this.autoCityValues = this.sharedService.cityNames.filter((item) => {
        return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
      })
    } else {
      this.autoCityValues = [];
    }
  }

  selectItem(value) {
    this.autoCityValues = [];
    this.farmr.city = value;
    this.invalidFarmrCity = false;
  }

  setDefault() {
    this.invalidFarmrCity = false;
  }
}
