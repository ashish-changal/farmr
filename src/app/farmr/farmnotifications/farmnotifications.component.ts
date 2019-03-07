import { Component, OnInit } from '@angular/core';
import { FarmrService } from '../services/farmr.service';
import { AuthService } from '../../auth/auth.service';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-farmnotifications',
  templateUrl: './farmnotifications.component.html',
  styleUrls: ['./farmnotifications.component.css']
})
export class FarmnotificationsComponent implements OnInit {

  notifications = [];
  p: any = 1;
  _sub:any;
  farmKey:any;
  noDataFound: string = "Fetching data...";
  selectedNotifications:any = [];
  trashActive:boolean = false;
  constructor(public farmrService: FarmrService, public authService: AuthService,
              public parent: FarmrComponent, public sharedService: SharedService) { }

  ngOnInit() {

    this.parent.pageTitle = "Notifications";
   
    this.authService.checkLogin().take(1).subscribe( uid => {
      this.farmrService.getFarmKey(uid).then((farmkey) => {
        this.farmKey = farmkey;
        this.getAllNotifications(farmkey);
      })
    })
  }

  ngOnDestroy() {
    if (this._sub != undefined && this._sub != null) {
      this._sub.unsubscribe();
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('notifications');
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }

  getAllNotifications(farmkey){
       if (farmkey && farmkey != undefined && farmkey != null) {
        this._sub = this.farmrService.getFarmNotifications(farmkey).subscribe((farmrNotifications) =>{
          this.displayNotifications(farmrNotifications);
         })
       }else{
        this.noDataFound = "No notifications found";
       }
  }

  displayNotifications(results){
    if(results.length > 0){
      this.notifications = [];
      Object.keys(results[0]).map((key)=>{
        let data = results[0][key];
        let date = this.sharedService.getFormattedDate(data.date);
        let notification = {
          key:key,
          datesort: data.date,
          date: date,
          message: data.message,    
          readstatus:data['readstatus']          
        }
        this.notifications.push(notification);
      })
      if(this.notifications.length == 0){
        this.noDataFound = "No notifications found";
      }
      this.notifications = this.notifications.sort((a, b) =>{
        return b.datesort - a.datesort;
      })
    }else{
      this.noDataFound = "No notifications found"
    }
  }
  readNotifiction(key){
     this.farmrService.readnotifiaction(key, this.farmKey);
  }
  deleteNotifications() {
    this.selectedNotifications.forEach((notification) => {
      this.farmrService.deleteNotification(notification.key, this.farmKey);
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
        this.farmrService.readnotifiaction(notification.key, this.farmKey);
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
