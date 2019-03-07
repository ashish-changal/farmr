import { Component, OnInit } from '@angular/core';
import { OrderHistory } from '../../models/detailtransaction.model';
import { UsersComponent } from '../users.component';
import { AuthService } from '../../auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoggerService } from '../../logger.service';

@Component({
  selector: 'app-detailhistory',
  templateUrl: './detailhistory.component.html',
  styleUrls: ['./detailhistory.component.css']
})
export class DetailhistoryComponent implements OnInit {

  order: OrderHistory = <OrderHistory>{};
  transactionStatus: string = '';
  uid: any;
  orderkey: any;
  transactionId: string;
  toggle: boolean = true;
  response: string = "";
  responseClass = '';
  constructor(public parent: UsersComponent, public authService: AuthService,
    public activatedRoute: ActivatedRoute, public userService: UserService,
    public sharedService: SharedService,
    public spinner: NgxSpinnerService, public loggerService: LoggerService) { }

  ngOnInit() {
    this.parent.pageTitle = "Transaction Summary";
    this.sharedService.selectSidemenu('history');
    this.authService.checkLogin().subscribe((uid) => {
      if (uid) {
        this.uid = uid;
        this.order.uid = uid;
      }
    })
    this.orderkey = this.activatedRoute.snapshot.paramMap.get("ordernumber");
    this.getTransactionDetail();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('history');
      this.sharedService.setSearchBox(false);
    })
  }

  getTransactionDetail() {
    this.userService.getDetailTransaction(this.orderkey).then(orderResponse => {
      if (orderResponse) {
        this.order['orderNumber'] = orderResponse.ordernumber ? orderResponse.ordernumber : this.orderkey;
        this.order['orderKey'] = this.orderkey;
        let d = new Date(orderResponse.orderdate);
        this.order.orderTime = d.getTime();
        this.order.farmKey = orderResponse.farmkey;
        this.order.orderStatus = orderResponse.ordersstatus;
        this.transactionStatus = orderResponse.ordersstatus;
        this.order.salesTax = orderResponse.salestax;
        if (orderResponse.couponapplied != undefined && orderResponse.couponapplied != null) {
          this.userService.getCouponDetail(orderResponse.couponapplied, this.uid).then((coupon) => {
            this.order.discountAmount = coupon[0].discount;
          })
        }
        if (orderResponse['totalrefunds'] != null && orderResponse['totalrefunds'] != undefined) {
          Object.keys(orderResponse['totalrefunds']).map((key, index) => {

            if (index > 0) {
              this.order.refundAmount = this.order.refundAmount + orderResponse['totalrefunds'][key].amount;
            } else {

              this.order.refundAmount = orderResponse['totalrefunds'][key].amount;
            }
          })
        }

        let currentTime = this.userService.getTimeWithTimezone();
        let checkTime = orderResponse.orderdate + 2 * 60 * 60 * 1000;
        if (currentTime < checkTime && this.order.orderStatus == 'Unfulfilled') {
          this.transactionId = orderResponse.transactionid;
          this.toggle = false;
        } else {
          this.toggle = true;
        }
        this.userService.getSingleFarm(orderResponse.farmkey).then(farm => {

          let produces = orderResponse.produces;
          let producesArray = [];
          Object.keys(produces).map((key, index) => {
            Object.keys(produces[key]).map((producekey, index) => {
              let producedesc = produces[key][producekey]['proddesc'];
              let split = producedesc.split(" ");
              produces[key][producekey]['quantityDisp'] = `${produces[key][producekey]['selectedQuantity']} ${split[1]}`;
              produces[key][producekey]['produceKey'] = producekey;
              //   produces[key][producekey]['image']= farm['stock'][producekey]['image']?farm['stock'][producekey]['image']:produces[key][producekey]['image'];
              producesArray.push(produces[key][producekey]);
            })
          })
          this.order['produces'] = producesArray;
          this.order.amount = orderResponse.amount / 100;
          this.order['orderDate'] = this.sharedService.getFormattedDateTime(orderResponse.orderdate);
          this.order['pickup1'] = orderResponse.pickup1;
          this.order['pickup2'] = orderResponse.pickup2;
          this.order['pickup3'] = orderResponse.pickup3;

          this.order['farmName'] = farm.name;
          this.order['contactNumber'] = '(' + farm['phonenumber'].substr(0, 3) + ') ' + farm['phonenumber'].substr(3, 3) + '-' + farm['phonenumber'].substr(6, 4);
          this.order['farmAddress1'] = farm.farmaddress1 + ' ,' + farm.farmaddress2;
          this.order['farmAddress2'] = farm.city + ', ' + farm.state + ' ' + farm.zipcode;
        })
      }
    })
  }

  cancelOrder() {
    this.spinner.show();
    let currentTime = this.userService.getTimeWithTimezone();
    let checkTime = this.order.orderTime + 2 * 60 * 60 * 1000;
    if (currentTime < checkTime) {
      this.userService.cancelOrder(this.order.orderNumber, this.transactionId).then((res) => {
        this.spinner.hide();
        this.responseClass = 'response-success';
        this.response = "Order is cancelled and refund initiated";
        setTimeout(() => {
          this.response = "";
        }, 5000)
        this.toggle = !this.toggle;
        this.getTransactionDetail();
      }).catch((err) => {
        this.spinner.hide();
        this.responseClass = 'response-failed';
        this.response = err;
        setTimeout(() => {
          this.response = "";
        }, 5000)
        let errMessage = "Error processing cancellation for uid " + this.uid + " due to reason " + err;
        this.loggerService.log(errMessage);
      })
    } else {
      
      this.spinner.hide();
      this.responseClass = 'response-failed';
      this.response = "Sorry you can not cancel your order now";
      this.getTransactionDetail();
    }
  }
}
