import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin.component';
import { ServiceService } from '../service.service';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-adminnotifications',
  templateUrl: './adminnotifications.component.html',
  styleUrls: ['./adminnotifications.component.css']
})
export class AdminnotificationsComponent implements OnInit {
  notifications = [];
  _sub: any;
  p: any = 1;
  noRecord:string = '';
  selectedNotifications:any = [];
  trashActive:boolean = false;
  constructor(public parent: AdminComponent, public sharedService: SharedService,
    public services: ServiceService) { }

  ngOnInit() {
    this.parent.pageTitle = "Notifications";

    this._sub = this.services.getAllNotifications().subscribe((results) => {
      if (results.length > 0) {
        this.notifications = [];
        Object.keys(results[0]).map((key)=>{
          let result = results[0][key];
          let date = this.sharedService.getFormattedDate(result['date']);
          let notification = {
            key: key,
            datetime: result['date'],
            date: date,
            message: result['message'],
            readstatus:result['readstatus']
          }
          this.notifications.push(notification);
        })
        this.notifications = this.notifications.sort((a, b)=>{
          return b.datetime - a.datetime
        })
      }else{
        this.noRecord = 'No notifications found';
      }
    }) 

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
      this.sharedService.selectSidemenu("notification");
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
  }
  readNotifiction(key) {
    this.services.readnotifiaction(key);
  }
  deleteNotifications() {
    this.selectedNotifications.forEach((notification) => {
      this.services.deleteNotification(notification.key);
    })
    this.trashActive = false;
  }
  readNotifications(){
    this.selectedNotifications.forEach((notification) => {
      let index = this.notifications.indexOf(notification);
      if(index > -1){
        this.notifications[index].selected = false;
      }
      if(notification.readstatus == 0){
        this.services.readnotifiaction(notification.key);
      }
    })
    this.trashActive = false
  }
  checkBoxMarked(){ 
    this.selectedNotifications = this.notifications.filter((notification)=>{
      return notification.selected == true
    });
    if(this.selectedNotifications.length > 0){
      this.trashActive = true;
    }else{
      this.trashActive = false;
    }
  }
}
