import { Component, OnInit, NgZone } from '@angular/core';
import { FarmsService } from '../services/farms.service';
import { UsersComponent } from '../users.component';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../../shared.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-nearbyfarms',
  templateUrl: './nearbyfarms.component.html',
  styleUrls: ['./nearbyfarms.component.css'],


})

export class NearbyfarmsComponent implements OnInit {
  farms = [];
  uid: any;
  farmsForSearch = [];
  noDataFound: string = "";
  userData:any = {};
  constructor(public farmrService: FarmsService, public zone: NgZone,
    public parent: UsersComponent, public sharedService: SharedService,
    public userService: UserService, public router: Router,
    private spinner: NgxSpinnerService, public authService: AuthService) {
  }

  ngOnInit() {
    let self = this;
    navigator.geolocation.getCurrentPosition(function(location){
      self.userData.latitude = location.coords.latitude;
      self.userData.longitude = location.coords.longitude;
      self.authService.checkLogin().take(1).subscribe(uid=>{
        self.userData["uid"] = uid;  
        self.uid = uid;
        self.getFarms();
      })
    }, function(error){
      console.log(error);
      self.noDataFound = "Please enable location services on your device, for better user experience.";
    })
    this.parent.pageTitle = 'Nearby Farms';

    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.farms = this.farmsForSearch;

      if (val && val.trim() != '') {
        this.farms = this.farms.filter((item) => {
          return (item.address_line1.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.address_line2.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) == 0 ||
            item.name.toLowerCase().indexOf(val.toLowerCase()) == 0);
        })
        if (this.farms.length == 0) {
          this.noDataFound = "No record Found";
        }
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('nearbyfarms');
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Farm name/Address/Zipcode");
    })
  }

  getFarms() {
    this.spinner.show();
    this.farms = [];

    this.userService.getNearbyFarms(this.userData).then((farms)=>{
      this.spinner.hide();
      if(farms.length == 0){
        this.noDataFound = "No participating farms found within your area. We strive to find farms in every corner and we will inform you when we find one";
      }else{
        this.farms = farms;
        this.farmsForSearch = farms;
      }
    }).catch(err=>{
    })
  }

  changeFav(farmkey, choicekey) {
    if (choicekey) {
      this.farmrService.removeFromFavourite(farmkey, choicekey).then((res) => {
        if (res) {
          this.getFarms();
        } else {
          // alert("Server problem try again later");
        }
      })

    } else {
      this.spinner.show();
      this.farmrService.addToFavourite(farmkey, this.uid).then((res) => {
        if (res) {
          this.getFarms();
        } else {
          // alert("Server problem try again later");
        }
      })
    }
  }

  goToProduce(farmkey) {
    this.router.navigate(['users/nearbyfarms/produce', farmkey]);
  };

  goToFarm(farmKey) {
    this.router.navigate(['users/nearbyfarms/farmdetail', farmKey]);
  };
}

