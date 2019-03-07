import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin.component';
import { SharedService } from '../../shared.service';
import { ServiceService } from '../service.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-pendingfarms',
  templateUrl: './pendingfarms.component.html',
  styleUrls: ['./pendingfarms.component.css']
})
export class PendingfarmsComponent implements OnInit {
  farms = [];
  _sub; any;
  responseClass: string;
  response: string = "";

  p: any = 1;
  itemsForSearch: any = [];
  noDataFound: string = 'Fetching data...';
  constructor(public parent: AdminComponent, public sharedService: SharedService,
    public services: ServiceService, public authService: AuthService) { }

  ngOnInit() {
    this._sub = this.services.getFarms().subscribe(res => {
      if (res.length > 0) {
        this.farms = [];
        for (let i = 0; i < res.length; i++) {
          if (res[i]['status'].toLowerCase() == 'pending') {
            if (res[i]['farmruid']) {
              this.authService.getUserInformation(res[i]['farmruid']).then((user) => {
                let data = {};
                data['key'] = res[i].key;
                data['image'] = res[i].image;
                data['name'] = res[i].name;
                data['address1'] = res[i].farmaddress1 + ' ' + res[i].farmaddress2;
                data['address2'] = res[i].city + ', ' + res[i].state + ' ' + res[i].zipcode;
                data['zipcode'] = res[i].zipcode;
                data['farmOwner'] = user[0]['firstname'] + ' ' + user[0]['lastname'];
                data['email'] = user[0]['email'];
                this.farms.push(data);
                this.itemsForSearch = this.farms;
              })
            }
          }
        }
        if(this.farms.length == 0){
          this.noDataFound = "No Farm is in pending state";
        }
      } else {
        this.noDataFound = "No Farm is added till date";
      }
    })
    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.farms = this.itemsForSearch;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.farms = this.farms.filter((item) => {
          return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.address1.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) == 0)
        })
        if (this.farms.length == 0) {
          this.noDataFound = "No record found";
        }
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.parent.pageTitle = "Pending Farms";
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Farm name/Address/Zipcode");
      this.sharedService.setProduceButtonValue(false);
      this.sharedService.selectSidemenu("pendingfarms");
    })
  }
  ngOnDestroy() {
    this._sub.unsubscribe();
  }
  approve(farm: any) {
    let notifications = [];
    if(farm.users){
      let users = farm.users;
      Object.keys(users).map((key)=> {
        if(+Object.keys(users[key])[1] < 20){
          let uid = Object.keys(users[key])[0];
          notifications.push({
            'message': 'A new farm, '+farm.name+' was added within your area. You may check it out for your produce needs.',
            'key': uid
          })
        }
      })
    }
    let data = { 'receiver': farm.email, 'subject': 'Farm Approved', 'message': "Dear " + farm.farmOwner + ",\n\n Congratulations! Your request to sell fresh farm produce has been approved. You may proceed to add your produce inventory for sale." };
    this.services.approveFarm(farm.key, farm.name).then((res) => {
      if (res) {
        this.authService.sendMail(data);
        this.services.sendNotification(notifications);
        this.responseClass = 'response-success';
        this.response = "Updated Successfully";
      } else {
        this.responseClass = 'response-success';
        this.response = "Some problem occurs please try again later";
      }
    })
  }

  disApprove(farm: any) {
    let data = { 'receiver': farm.email, 'subject': 'Your request to add, '+farm.name+' has been denied.', 'message': "Dear " + farm.farmOwner + ",\n\n  Your request for adding " + farm.name + " has been rejected. Please contact the system admin for further details." };
    this.services.rejectFarm(farm.key, farm.name).then((res) => {
      if (res) {
        this.authService.sendMail(data);
        this.responseClass = 'response-success';
        this.response = "Updated Successfully";
      } else {
        this.responseClass = 'response-success';
        this.response = "Some problem occurs please try again later";
      }
    })
  }
}
