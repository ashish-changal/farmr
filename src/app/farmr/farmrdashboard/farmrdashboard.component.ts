import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FarmrService } from '../services/farmr.service';
import { Router } from '@angular/router';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-farmrdashboard',
  templateUrl: './farmrdashboard.component.html',
  styleUrls: ['./farmrdashboard.component.css']
})
export class FarmrdashboardComponent implements OnInit {
  orderlist = [];
  salesChoice = 'year';
  produces = [];
  ordersTofulfill: number = 0;
  totaluser: number = 0;
  customers = [];
  produceSales: number = 0;
  _sub: any = [];
  lowProduceInv: string = "";
  noTransaction: string = "";
  constructor(public authService: AuthService, public farmrService: FarmrService,
              public router: Router, public parent: FarmrComponent, 
              public sharedService: SharedService , public spinner :NgxSpinnerService) {
     }

  ngOnInit() {
  this.spinner.show();
   
    this.parent.pageTitle = "Dashboard";
    this.authService.checkLogin().subscribe(res => {
      let sub = this.farmrService.getAllProduce(res).subscribe(res => {
        if (res.length > 0) {
          this.spinner.hide();
          for (let i = 0; i < res.length; i++) {
            let stock = res[i]['stock'];
            let farmKey = res[i]['key'];
            if (stock != undefined && stock != null) {
              Object.keys(stock).map((key, index) => {
                let desc = stock[key].productdesc;
                let unitDesc = desc.split(" ")[1];
                let lowinventory = +stock[key].lowinventory;
                let totalQuantity = +stock[key].totalquantity;
                if ( totalQuantity <= lowinventory) {
                  let produce = {
                    producekey: key,
                    totalquantity: `${totalQuantity} ${unitDesc}`,
                    producename: stock[key].productname,
                    image: stock[key].image != " " ? stock[key].image : './assets/imgs/grey.png',
                  }
                  this.produces.push(produce);
                }
              })
              if (this.produces.length == 0) {
                this.lowProduceInv = "Get notified when the produce inventory is low";
              }
            } else {
              this.lowProduceInv = "No Produce found please add.";
            }

            this.produces= this.produces.sort((a ,b)=>{
              if(a.producename > b.producename) return 1
              else if(a.producename < b.producename) return -1
              else return 0
            })
          }
        } else {
          this.spinner.hide();
          this.lowProduceInv = "No Farm has been added.";
          this.noTransaction = "No Transaction found.";
        }
      });
      this._sub.push(sub);
    })
    this.getSalesResult();
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
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('dashboard');
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }
  getSalesResult() {
    let self = this;
    this.authService.checkLogin().subscribe(uid => {
      if (uid) {
        this.farmrService.getFarmKey(uid).then(farmkey => {
          if (farmkey) {
            let sub = this.farmrService.getAllOrders(farmkey).subscribe(res => {
             
              if (res.length > 0) {
                this.customers = [];
                this.orderlist = [];
                this.totaluser = 0;
                this.produceSales = 0;
                this.ordersTofulfill = 0;
                let currDate = this.sharedService.getDatewithTimezone();
                if (res.length > 0) {
                  for (let i = 0; i < res.length; i++) {
                    let data = {};
                    let orderdate = new Date(res[i].orderdate);
                    let formatedOrderDate = this.sharedService.getFormattedDate(res[i].orderdate);
                    data['orderNumber'] = res[i].ordernumber?res[i].ordernumber:res[i].key;
                    data['orderKey'] = res[i].key;
                    data['amount'] = res[i].amount / 100;
                  //  data['amount'] = res[i].amount;
                    data['status'] = res[i].ordersstatus;
                    data['orderdate'] = formatedOrderDate;
                    data['date'] = res[i].orderdate;
                    if (currDate.getFullYear() == orderdate.getFullYear() && this.salesChoice == 'year') {
                      this.produceSales = this.produceSales + data['amount'];
                    }else if (this.salesChoice == 'month') {
                      let currMonth = `${currDate.getMonth()} ${currDate.getFullYear()}`;
                      let orderMonth = `${orderdate.getMonth()} ${orderdate.getFullYear()}`;
                      if (currMonth == orderMonth) {
                        this.produceSales = this.produceSales + data['amount'];
                      }
                    }else if(this.salesChoice == 'week'){
                      let curr = this.sharedService.getDatewithTimezone();
                      let weekDate = new Date(curr.setDate(curr.getDate() - curr.getDay()));
                      if(orderdate.getTime() > weekDate.getTime()){
                        this.produceSales = this.produceSales + data['amount'];
                      }
                    }else if (this.salesChoice == 'day') {
                      let currDay = `${currDate.getDate()} ${currDate.getMonth()} ${currDate.getFullYear()}`;
                      let orderDay = `${orderdate.getDate()} ${orderdate.getMonth()} ${orderdate.getFullYear()}`;
                      if (currDay == orderDay) {
                        this.produceSales = this.produceSales + data['amount'];
                      }
                    }
                    if (res[i].ordersstatus == "Unfulfilled") {
                      this.ordersTofulfill = this.ordersTofulfill + 1;
                    }
                    this.customers.push(res[i].uid);
                    this.orderlist.push(data);
                  }
                  this.sortByDate();
                  this.customers = this.uniqEs6(this.customers);
                  this.totaluser = this.customers.length;
                }
              } else {
                this.noTransaction = "No Transaction found.";
              }
            });
            self._sub.push(sub);
          }
        })
      }
    })
  }
  openDetailTransaction(orderKey) {
    this.router.navigate(['farmr/transaction/detailtransaction', orderKey]);
  }
  ngOnDestroy() {
    for (let i = 0; i < this._sub.length; i++) {
      this._sub[i].unsubscribe();
    }
  }
  uniqEs6(arrArg) {
    return arrArg.filter((elem, pos, arr) => {
      return arr.indexOf(elem) == pos;
    });
  }
  sortByDate(){
    this.orderlist.sort((a, b) => {
      return b['date'] - a['date'];
    })
  }
}
