import { Component, OnInit } from '@angular/core';
import { UsersComponent } from '../users.component';
import { SharedService } from '../../shared.service';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications = [];
  _sub: any;
  uid: any;
  p: any = 1;
  selectedNotifications = [];
  trashActive:boolean = false;
  noDataFound: string = "Fetching data..."
  constructor(public parent: UsersComponent, public sharedService: SharedService,
    public authService: AuthService, public userService: UserService) { }

  ngOnInit() {
    this.parent.pageTitle = "Notifications";
    this.authService.checkLogin().take(1).subscribe(uid => {
      this.uid = uid
      this._sub = this.userService.getNotifications(uid).subscribe((results) => {
        if (results.length > 0) {
          this.notifications = [];
          Object.keys(results[0]).map((key) => {
            let data = results[0][key];
            let date = this.sharedService.getFormattedDate(data['date']);
            let notification = {
              key: key,
              selected: false,
              date: date,
              message: data['message'],
              readstatus: data['readstatus'],
              datetime: data.date
            }
            this.notifications.push(notification);
          })
          this.notifications = this.notifications.sort((a, b) => {
            return b.datetime - a.datetime
          })
        } else {
          this.noDataFound = "No notifications found";
        }
      })
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('notification');
      this.sharedService.setSearchBox(false);
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
  }

  readNotifiction(key) {
    this.userService.readnotifiaction(key, this.uid);
  }

  deleteNotifications() {
    this.selectedNotifications.forEach((notification) => {
      this.userService.deleteNotification(notification.key);
    })
    this.trashActive = false
  }
  readNotifications(){
    this.selectedNotifications.forEach((notification) => {
      let index = this.notifications.indexOf(notification);
      if(index > -1){
        this.notifications[index].selected = false;
      }
      if(notification.readstatus == 0){
        this.userService.readnotifiaction(notification.key, this.uid);
        this.trashActive = false
      }
    })
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
