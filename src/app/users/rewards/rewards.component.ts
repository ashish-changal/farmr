import { Component, OnInit } from '@angular/core';
import { UsersComponent } from '../users.component';
import { SharedService } from '../../shared.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {

  rewards = [];
  p: any = 1;
  noDataFound: string = '';
  constructor(public parent: UsersComponent, public sharedService: SharedService,
    public userService: UserService, public authService: AuthService, public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.authService.checkLogin().subscribe(uid => {
      if (uid) {
        this.userService.getAllCoupons(uid).then((coupons) => {
          if(coupons.length > 0){
            Object.keys(coupons[0]).map((key) => {
              let coupon = coupons[0][key];
              let issuedate = new Date(coupon.issuedate);
              let redemptiondate:any;
              let data = {
                rewardCertificate: coupon.code,
                issueDate: issuedate.getMonth() + 1 + "/" + issuedate.getDate() + "/" + issuedate.getFullYear(),
                redemptionDate: '--',
                rewardPrice: coupon.discount
              }
              if(coupon.redeemeddate){
                redemptiondate = new Date(coupon.redeemeddate);
                data.redemptionDate = redemptiondate.getMonth() + 1 + "/" + redemptiondate.getDate() + "/" + redemptiondate.getFullYear();
              }
              this.rewards.push(data);
            })
          }else{
            this.noDataFound = "No reward certificates earned just yet. Please continue to make purchases to earn rewards.";
          }
          this.spinner.hide();
        })
      }
    })
  }
  ngAfterViewInit() {
    this.parent.pageTitle = "Rewards";
    setTimeout(() => {
      this.sharedService.selectSidemenu('rewards');
      this.sharedService.setSearchBox(false);
    })
  }
}
