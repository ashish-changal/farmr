import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FarmrService } from '../services/farmr.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-farmrtransaction',
  templateUrl: './farmrtransaction.component.html',
  styleUrls: ['./farmrtransaction.component.css']
})
export class FarmrtransactionComponent implements OnInit {

  orders = [];
  p: any = 1; 
  itemsForSearch = [];
  _sub: any;
  noDataFound: string = "";
  toggle = {
    price: 2,
    name: 2,
    status: 2,
    date: 2
  }
  constructor(public authService: AuthService, public farmrService: FarmrService,
    public router: Router, public parent: FarmrComponent,public activeRoute: ActivatedRoute,
    public sharedService: SharedService, public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.parent.pageTitle = "Transactions";
    this.authService.checkLogin().subscribe(uid => {
      if (uid) {
        this.farmrService.getFarmKey(uid).then(farmkey => {
          if (farmkey) {

            this._sub = this.farmrService.getAllOrders(farmkey).subscribe(ordersResponse => {
              this.spinner.hide();
              this.orders = [];

              if (ordersResponse.length > 0) {
                this.sharedService.setSearchBox(true);
                this.sharedService.setSearchBoxText("Search by Order/Customer/Status");

                for (let i = 0; i < ordersResponse.length; i++) {

                  let singleOrder = ordersResponse[i];
                  this.authService.getUserInformation(singleOrder.uid).then(user => {
                    let remarks = '';
                    if (singleOrder['totalrefunds'] != null && singleOrder['totalrefunds'] != undefined) {
                      Object.keys(singleOrder['totalrefunds']).map((key, index) => {
                        if (index > 0) {
                          remarks = remarks + ', ' + singleOrder['totalrefunds'][key].remarks;
                        } else {
                          remarks = singleOrder['totalrefunds'][key].remarks;
                        }
                      })
                    } else {
                      remarks = singleOrder.remarks ? singleOrder.remarks : "";
                    }
                    let orderDate = this.sharedService.getFormattedDate(singleOrder.orderdate);
                    let order = {
                      orderNumber: singleOrder.ordernumber ? singleOrder.ordernumber : singleOrder.key,
                      orderKey: singleOrder.key,
                      amount: singleOrder.amount / 100,
                      //  amount: singleOrder.amount,
                      customerName: user[0].firstname + ' ' + user[0].lastname,
                      status: singleOrder.ordersstatus,
                      orderdate: orderDate,
                      date: singleOrder.orderdate,
                      remarks: remarks
                    }
                    this.orders.push(order);
                    this.itemsForSearch = this.orders;
                    if(this.activeRoute.snapshot.paramMap.get('orderby') == 'unfulfilled'){
                      this.sortByColumn('status', 0);
                    }else{
                      this.sortByColumn('date', 0);
                    }
                  })
                }
              } else {
                this.sharedService.setSearchBox(false);
                this.noDataFound = "No transaction found";
              }
            });
          } else {
            this.spinner.hide();
            this.sharedService.setSearchBox(false);
            this.noDataFound = "No transaction found";
          }
        })
      }
      this.sharedService.currentSearch.subscribe(res => {
        let val: any = res;
        this.orders = this.itemsForSearch;
        this.noDataFound = "";
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
          this.orders = this.orders.filter((item) => {
            return (item.orderNumber.toLowerCase().indexOf(val.toLowerCase()) == 0 ||
              item.customerName.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
              item.status.toLowerCase().indexOf(val.toLowerCase()) == 0)
          })
          if (this.orders.length == 0) {
            this.noDataFound = "No records found";
          }
        }
      })
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('transactions');
      this.sharedService.setProduceButtonValue(false);
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined && this._sub != null) {
      this._sub.unsubscribe();
    }
  }
  openDetailTransaction(orderKey) {
    this.router.navigate(['farmr/transaction/detailtransaction', orderKey]);
  }

  sortByColumn(columnDef, toggle) {
    switch (columnDef) {
      case 'price':
        if (toggle == 0) {
          this.itemsForSearch = this.orders.sort((a, b) => {
            return b['amount'] - a['amount'];
          })
        } else {
          this.itemsForSearch = this.orders.sort((a, b) => {
            return a['amount'] - b['amount'];
          })
        }
        this.toggle = {
          price: toggle == 0 ? 1 : 0,
          name: 2,
          status: 2,
          date: 2
        }
        break;
      case 'name':
        this.itemsForSearch = this.orders = this.customSort('customerName', toggle);
        this.toggle = {
          price: 2,
          name: toggle == 0 ? 1 : 0,
          status: 2,
          date: 2
        }
        break;
      case 'status':
        this.itemsForSearch = this.orders = this.customSort('status', toggle);
        this.toggle = {
          price: 2,
          name: 2,
          status: toggle == 0 ? 1 : 0,
          date: 2
        }
        break;
      case 'date':
        this.itemsForSearch = this.orders = this.customSort('date', toggle);
        this.toggle = {
          price: 2,
          name: 2,
          status: 2,
          date: toggle == 0 ? 1 : 0
        }
        break;
    }
  }

  customSort(key, toggle) {
    if (toggle == 0) {
      return this.orders.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      })
    } else {
      return this.orders.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      })
    }
  }
}
