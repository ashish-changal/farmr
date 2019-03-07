import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ServiceService } from '../service.service';
import { AdminComponent } from '../admin.component';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-admindashboard',
  templateUrl: './admindashboard.component.html',
  styleUrls: ['./admindashboard.component.css']
})
export class AdmindashboardComponent implements OnInit {
  orderlist = [];
  sortIcon:boolean= true;
  itemsForSearch = [];
  pendingFarmForApproval: number = 0;
  totaluser: number = 0;
  customers = [];
  produceSales: number = 0;
  _sub: any = <any>[];
  p: any = 1;
  noTransaction: string = 'Fetching data...';
  salesChoice = 'year';
  refundStatus:any = [];
  checkRefundStatusToggle:boolean = false;
  toggle = {
    price: 2,
    status: 2,
    date: 2
  }
  constructor(public services: ServiceService, public router: Router,
    public parent: AdminComponent, public sharedService: SharedService) { }

  ngOnInit() {
    this.parent.pageTitle = "Dashboard";
    this.getSalesResult();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Order number");
      this.sharedService.setProduceButtonValue(false);
      this.sharedService.selectSidemenu("dashboard");
    })
  }

  ngOnDestroy() {
    for (let i = 0; i < this._sub.length; i++) {
      this._sub[i].unsubscribe();
    }
  }

  openDetailTransaction(orderKey) {
    this.router.navigate(['admin/dashboard/admindetailtransaction', orderKey]);
  }
  changeSortIcon()
  {
    this.sortIcon=false;
  }

  getSalesResult() {
  
    let sub_2 = this.services.getUsers().subscribe((users) => {
      this.totaluser = 0;
      if (users.length > 0) {
        users.forEach((user) => {
          if (user.usertype == 'basic') {
            this.totaluser++;
          }
        })
      }
      this._sub.push(sub_2);
    }) 
    let sub = this.services.orderlist().subscribe(res => {
      if (res.length > 0) {
        this.orderlist = [];
        let orders = [];
        this.orderlist = [];
        this.produceSales = 0;
        this.pendingFarmForApproval = 0;
        let currDate = this.sharedService.getDatewithTimezone();
        for (let i = 0; i < res.length; i++) {
          let data = res[i];
          let orderdate = new Date(data.orderdate);
          data['orderNumber'] = res[i].ordernumber ? res[i].ordernumber : res[i].key;
          data['orderKey'] = res[i].key;
          data['amount'] = res[i].amount / 100;
          data['status'] = res[i].ordersstatus;
          data['orderdate'] = res[i].orderdate;
          data['date'] = res[i].orderdate;
          let remarks = '';
          if (res[i]['totalrefunds'] != null && res[i]['totalrefunds'] != undefined) {
            Object.keys(res[i]['totalrefunds']).map((key, index) => {
              if (res[i].ordersstatus == "Refund Pending") {
                this.refundStatus.push({
                  refundId: res[i]['totalrefunds'][key].striperefundid,
                  orderKey: res[i].key,
                  remarks: res[i].remarks?res[i].remarks:null
                })
              }
              if (index > 0) {
                remarks = remarks + ', ' + res[i]['totalrefunds'][key].remarks;
              } else {
                remarks = res[i]['totalrefunds'][key].remarks;
              }
            })
          }
          if (remarks != '') {
            let r = res[i].remarks ? res[i].remarks : "";
            remarks = remarks + ', ' + r;
          } else {
            remarks = res[i].remarks ? res[i].remarks : "";
          }
          data['remarks'] = remarks;
          if (currDate.getFullYear() == orderdate.getFullYear() && this.salesChoice == 'year') {
            this.produceSales = this.produceSales + data['amount'];
          } else if (this.salesChoice == 'week') {
            let curr = this.sharedService.getDatewithTimezone();
            let weekDate = new Date(curr.setDate(curr.getDate() - curr.getDay()));
            if (orderdate.getTime() > weekDate.getTime()) {
              this.produceSales = this.produceSales + data['amount'];
            }
          } else if (this.salesChoice == 'month') {
            let currMonth = `${currDate.getMonth()} ${currDate.getFullYear()}`;
            let orderMonth = `${orderdate.getMonth()} ${orderdate.getFullYear()}`;
            if (currMonth == orderMonth) {
              this.produceSales = this.produceSales + data['amount'];
            }
          } else if (this.salesChoice == 'day') {
            let currDay = `${currDate.getDate()} ${currDate.getMonth()} ${currDate.getFullYear()}`;
            let orderDay = `${orderdate.getDate()} ${orderdate.getMonth()} ${orderdate.getFullYear()}`;
            if (currDay == orderDay) {
              this.produceSales = this.produceSales + data['amount'];
            }
          }
          orders.push(data);
        }
        orders = orders.sort((a, b) => {
          return b.orderdate - a.orderdate;
        })
        for (let i = 0; i < orders.length; i++) {
          orders[i].orderdate = this.sharedService.getFormattedDate(orders[i].orderdate);
          this.orderlist.push(orders[i]);
          this.itemsForSearch = this.orderlist;
        }
        this.sortByColumn('date', 0);
      }else{
        this.noTransaction = 'No transaction found';
      }
      if(!this.checkRefundStatusToggle) this.checkRefundStatus();
      this._sub.push(sub);
    })
    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.orderlist = this.itemsForSearch;
      if (val && val.trim() != '') {
        this.orderlist = this.orderlist.filter((item) => {
          return (item.orderNumber.toLowerCase().indexOf(val.toLowerCase()) > -1)
        })
        if(this.orderlist.length == 0){
          this.noTransaction = 'No record found with searched text.';
        }
      }
    })

    let sub_1 = this.services.getFarms().subscribe((farms) => {
      if (farms.length > 0) {
        this.pendingFarmForApproval = 0;
        for (let i = 0; i < farms.length; i++) {
          if (farms[i]['status'] != "approved") {
            this.pendingFarmForApproval++;
          }
        }
      }
    })
    this._sub.push(sub_1);
  }
  changeSalesView(choice) {
    switch (choice) {
      case 'day':
        this.salesChoice = 'day';
        this.getSalesResult();
        break;
      case 'week':
        this.salesChoice = 'week';
        this.getSalesResult();
        break;
      case 'month':
        this.salesChoice = 'month';
        this.getSalesResult();
        break;
      case 'year':
        this.salesChoice = 'year';
        this.getSalesResult();
        break;
    }
  }
  sortByColumn(columnDef, toggle) {
    switch (columnDef) {
      case 'price':
        if (toggle == 0) {
          this.itemsForSearch = this.orderlist.sort((a, b) => {
            return b['amount'] - a['amount'];
          })
        } else {
          this.itemsForSearch = this.orderlist.sort((a, b) => {
            return a['amount'] - b['amount'];
          })
        }
        this.toggle = {
          price: toggle == 0 ? 1 : 0,
          status: 2,
          date: 2
        }
        break;
      case 'status':
        this.itemsForSearch = this.orderlist = this.customSort('status', toggle);
        this.toggle = {
          price: 2,
          status: toggle == 0 ? 1 : 0,
          date: 2
        }
        break;
      case 'date':
        this.itemsForSearch = this.orderlist = this.customSort('date', toggle);
        this.toggle = {
          price: 2,
          status: 2,
          date: toggle == 0 ? 1 : 0
        }
        break;
    }
  }
  customSort(key, toggle) {
    if (toggle == 0) {
      return this.orderlist.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      })
    } else {
      return this.orderlist.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      })
    }
  }
  checkRefundStatus() {
    this.checkRefundStatusToggle = true;
    for (let i = 0; i < this.refundStatus.length; i++) {
     this.services.checkRefundStatus(this.refundStatus[i].refundId).then((res)=>{
       if(res){
        this.services.markAsFulfilled(this.refundStatus[i].orderKey, this.refundStatus[i], "Refund Processed");
       }
     });
    }
  }
}