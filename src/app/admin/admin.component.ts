import { Component } from '@angular/core';
import { ServiceService } from './service.service';
import { SharedService } from '../shared.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
declare var jQuery;
@Component({
  selector: 'admin-root',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  pageTitle: string = "Admin";
  hide: string = "show";
  toggle$: Observable<boolean>;
  sidemenuText: string;
  menuActive: any;
  notificationCount: any;
  userName: string;
  toggleButton$: Observable<boolean>;
  searchText$: Observable<string>;
  _sub: any;
  constructor(public authService: AuthService, public services: ServiceService, public sharedService: SharedService, public router: Router) {

  }
  ngOnInit() {

    this.authService.checkLogin().subscribe(uid => {
      this.authService.getUserInformation(uid).then(res => {
        this.userName = res[0]['firstname'] + " " + res[0]['lastname']

        this.sharedService.sidemenuSelected.subscribe((res) => {
          this.sidemenuText = res;
        }) 

       this._sub = this.services.getAllNotifications().subscribe((notification) => {
          if (notification.length > 0) {
            this.notificationCount = 0;
            Object.keys(notification[0]).map((key)=>{
              if (notification[0][key].readstatus == 0) {
                this.notificationCount++;
              }
            })  
          }
        })
      })
    })
    this.toggle$ = this.sharedService.isSearchBox;
    this.searchText$ = this.sharedService.searchBoxTextValue;
    this.toggleButton$ = this.sharedService.addProduceShow;
  }
  clearFarmKey() {
    this.sharedService.setClearData(true);
  }
  search(val: any) {
    this.sharedService.changeMessage(val);
  }
  addproduce() {
    this.router.navigate(['admin/adminfarm/addnewfarm']);
  }

  ngOnDestroy() {
    if(this._sub != undefined){
      this._sub.unsubscribe();
    }
  }

  signout() {
    this.authService.doLogout().then((res) => {
      this.router.navigate(['/login']);
    })
  }

  clickToggle() {
    this.menuActive = !this.menuActive;
    if (!this.menuActive) {

      this.hide = "show";
    }
    else {

      this.hide = "hidden";

    }
    jQuery('#sidebar').toggleClass('active');
    jQuery('#content').toggleClass('active');
  }

}


