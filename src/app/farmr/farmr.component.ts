import { Component } from '@angular/core';
import { FarmrService } from './services/farmr.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../shared.service';
import { AuthService } from '../auth/auth.service';
declare var jQuery;
@Component({
  selector: 'farmr-root',
  templateUrl: './farmr.component.html',
  styleUrls: ['./farmr.component.css']
})
export class FarmrComponent {

  pageTitle: string = "Dashboard";
  hide: string = "show";
  toggle$: Observable<boolean>;
  notificationCount: any;
  toggleButton$: Observable<boolean>;
  menuActive: any;
  userName: string;
  sidemenuText: string;
  searchText$: Observable<string>;
  farmName: string;
  _sub:any = [];
  constructor(public farmerservice: FarmrService, public router: Router,
    public sharedService: SharedService, public authService: AuthService,
    public farmrService: FarmrService) {

  }
  ngOnInit() {

    this.authService.checkLogin().subscribe(uid => {
      this.authService.getUserInformation(uid).then(res => {
        this.userName = res[0]['firstname'] + " " + res[0]['lastname']
        this.sharedService.sidemenuSelected.subscribe((res) => {
          this.sidemenuText = res;
        })
      })


      this.farmrService.getFarmKey(uid).then((farmkey) => {
        if (farmkey && farmkey != undefined && farmkey != null) {
          let sub = this.farmerservice.getFarmNotifications(farmkey).subscribe((famrNotifications) => {
            this.notificationCount=0;
            if(famrNotifications.length > 0){
              Object.keys(famrNotifications[0]).map((key) => {
                if (famrNotifications[0][key].readstatus == 0) {
                  this.notificationCount++
                }
              })
            }
            this._sub.push(sub);
          })
        } 
      })
      if (uid) {
        let sub1 = this.farmerservice.getFarmName(uid).subscribe((farm) => {
          if (farm.length > 0) {
            this.farmName = farm[0].name;
          }else{
            this.farmName = "";
          }
          this._sub.push(sub1);
        })
      }
    })

    this.toggle$ = this.sharedService.isSearchBox;
    this.searchText$ = this.sharedService.searchBoxTextValue;
    this.toggleButton$ = this.sharedService.addProduceShow;
  }

  ngOnDestroy() {
    this._sub.forEach(sub =>{
      sub.unsubscribe();
    })
  }

  search(val: any) {
    this.sharedService.changeMessage(val);
  }
  clearProduceKey() {
    this.sharedService.setClearData(true);
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

