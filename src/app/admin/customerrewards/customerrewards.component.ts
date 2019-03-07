import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin.component';
import { SharedService } from '../../shared.service';
import { ServiceService } from '../service.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-customerrewards',
  templateUrl: './customerrewards.component.html',
  styleUrls: ['./customerrewards.component.css']
})
export class CustomerrewardsComponent implements OnInit {
  rewards = [];
  _sub: any = [];
  noDataFound: string = 'Fetching data ...';
  itemsForSearch = [];
  p: any = 1;
  toggle = {
    name: 2,
    issuedate: 2,
    redemptiondate: 2
  }
  constructor(public parent: AdminComponent, public sharedService: SharedService,
    public services: ServiceService, public authService: AuthService) { }

  ngOnInit() {

    this._sub = this.services.getAllCoupons().subscribe((coupons) => {
      this.rewards = [];
      if (coupons.length > 0) {
        coupons.forEach(userCoupons => {
          this.authService.getUserInformation(userCoupons.key).then((user) => {
            Object.keys(userCoupons).map((key) => {
              if (key != 'key') {
                let coupon = userCoupons[key];
                let issuedate = this.sharedService.getFormattedDate(coupon.issuedate);
                let data = {
                  number: coupon.rewardnumber,
                  customerName: user[0].firstname + " " + user[0].lastname,
                  rewardCertificate: coupon.code,
                  issuedate: coupon.issuedate,
                  redemptiondate: 0,
                  issueDate: issuedate,
                  redemptionDate: '--',
                  rewardPrice: coupon.discount
                }
                if (coupon.redeemeddate) {
                  let redemptiondate = this.sharedService.getFormattedDate(coupon.redeemeddate);
                  data.redemptiondate = coupon.redeemeddate;
                  data.redemptionDate = redemptiondate;
                }
                this.rewards.push(data);
                this.itemsForSearch = this.rewards;
              }
            })
          })
        })
      }else{
        this.noDataFound = "No record found";
      }
    })


    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.rewards = this.itemsForSearch;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.rewards = this.rewards.filter((item) => {
          return (item.customerName.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.number.toLowerCase().indexOf(val.toLowerCase()) == 0)
        })
        if (this.rewards.length == 0) {
          this.noDataFound = "No record found";
        }
      }
    })
  }
  ngAfterViewInit() {
    this.parent.pageTitle = "Rewards";
    setTimeout(() => {
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Reward number/Member name");
      this.sharedService.selectSidemenu("rewards");
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
  }

  sortByColumn(columnDef, toggle) {
    switch (columnDef) {
      case 'name':
        if (toggle == 0) {
          this.itemsForSearch = this.rewards.sort((a, b) => {
            if (a['customerName'] > b['customerName']) return -1;
            if (a['customerName'] < b['customerName']) return 1;
            return 0;
          })
        } else {
          this.itemsForSearch = this.rewards.sort((a, b) => {
            if (a['customerName'] < b['customerName']) return -1;
            if (a['customerName'] > b['customerName']) return 1;
            return 0;
          })
        }
        this.toggle = {
          name: toggle == 0 ? 1 : 0,
          issuedate: 2,
          redemptiondate: 2
        }
        break;
      case 'issuedate':
        this.itemsForSearch = this.rewards = this.customSort('issuedate', toggle);
        this.toggle = {
          name: 2,
          issuedate: toggle == 0 ? 1 : 0,
          redemptiondate: 2
        }
        break;
      case 'redemptiondate':
        this.itemsForSearch = this.rewards = this.customSort('redemptiondate', toggle);
        this.toggle = {
          name: 2,
          issuedate: 2,
          redemptiondate: toggle == 0 ? 1 : 0
        }
        break;
    }
  }
  customSort(key, toggle) {
    if (toggle == 0) {
      return this.rewards.sort((a, b) => {
        return b[key] - a[key];
      })
    } else {
      return this.rewards.sort((a, b) => {
        return a[key] - b[key];
      })
    }
  }

}
