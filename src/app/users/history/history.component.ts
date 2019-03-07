import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../services/user.service';
import { Key } from 'protractor';
import { SharedService } from '../../shared.service';
import { UsersComponent } from '../users.component';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  orders = [];
  itemsForSearch = [];
  _sub:any;
  toggle = {
    rewards: 2,
    status: 2,
    date: 2,
    amount:2
  }  
  p:any = 1;
  noDataFound:string = '';
  constructor(public authservice: AuthService, public userservices: UserService,
              public sharedService: SharedService, public parent: UsersComponent, 
              public router: Router , public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.parent.pageTitle = "History";
   
    this.authservice.checkLogin().subscribe(uid => {
     this._sub =  this.userservices.getOrderlist(uid).subscribe(res => {
      this.spinner.hide();
        if (res.length > 0) {
         
          setTimeout(() => {
            this.sharedService.selectSidemenu('history');
            this.sharedService.setSearchBox(true);
            this.sharedService.setSearchBoxText("Search by Order number/Status");
          })
          this.orders = [];
          for (let i = 0; i < res.length; i++) {
            let data = {};
            data['orderNumber'] = res[i].ordernumber?res[i].ordernumber:res[i].key;
            data['orderKey'] = res[i].key;
            data['pickup1'] = res[i]['pickup1'];
            data['ordersStatus'] = res[i]['ordersstatus'];
            data['amount']=res[i]['amount']/100;
            data['rewards'] = Math.round(res[i]['amount']/100);
            let orderDate = this.sharedService.getFormattedDate(res[i]['orderdate']);
            data['orderDate'] = orderDate;
            data['date'] = res[i]['orderdate'];
            this.orders.push(data);
          }
          this.sortByColumn('date',0);
          this.itemsForSearch = this.orders;
        } else {
          setTimeout(() => {
            this.sharedService.selectSidemenu('history');
            this.sharedService.setSearchBox(false);
          })
          this.noDataFound = "No transaction found";
        }
        this.sharedService.currentSearch.subscribe(res => {
          let val: any = res;
          this.orders = this.itemsForSearch;
          // if the value is an empty string don't filter the items
          if (val && val.trim() != '') {
            this.orders = this.orders.filter((item) => {
              return  (item.orderNumber.toLowerCase().indexOf(val.toLowerCase()) == 0 ||
                item.ordersStatus.toLowerCase().indexOf(val.toLowerCase()) == 0)
            })
            if(this.orders.length == 0){
              this.noDataFound = "No Transaction Found";
            }
          }
        })
      })
    })
  }
  openDetailHistory(orderKey) {
    this.router.navigate(['users/history/detailhistory', orderKey]);
  }

  ngOnDestroy(){
    if(this._sub != undefined){
      this._sub.unsubscribe();
    }
  }
  sortByColumn(columnDef, toggle){
    switch(columnDef){
      case 'rewards':
       if(toggle == 0){
        this.itemsForSearch = this.orders.sort((a, b) => {
          return b['rewards'] - a['rewards'];
        })
       }else{
        this.itemsForSearch = this.orders.sort((a, b) => {
          return a['rewards'] - b['rewards'];
        })
       } 
       this.toggle = {
        rewards: toggle == 0?1:0,
        status: 2,
        amount:2,
        date: 2
      }    
      break;
     
      case 'status':
        this.itemsForSearch =this.orders = this.customSort('ordersStatus', toggle);
        this.toggle = {
          rewards: 2,
          status: toggle == 0?1:0,
          date: 2,
          amount:2
        }
      break;
      case 'date':
        this.itemsForSearch =this.orders = this.customSort('date', toggle);
        this.toggle = {
          rewards: 2,
          status: 2,
          amount:2,
          date: toggle == 0?1:0
        }
      break;
      case 'amount':
        this.itemsForSearch =this.orders = this.customSort('amount', toggle);
        this.toggle = {
          rewards: 2,
          status: 2,
          amount:toggle == 0?1:0,
          date: 2
        }
      break;
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('history');
      this.sharedService.setSearchBox(true);
    })
  }
  customSort(key, toggle){
    if(toggle == 0){
      return this.orders.sort((a, b) => {
        if(a[key] > b[key]) return -1;
        if(a[key] < b[key]) return 1;
        return 0;
      })
    }else{
      return this.orders.sort((a, b) => {
        if(a[key] < b[key]) return -1;
        if(a[key] > b[key]) return 1;
        return 0;
      })
    }
  }
}
