import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ServiceService } from '../service.service';
import { OrderDetail, RefundDetail } from '../../models/detailtransaction.model';
import { AdminComponent } from '../admin.component';
import { SharedService } from '../../shared.service';
import { LoggerService } from '../../logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
declare var jQuery;
@Component({
  selector: 'app-admindetailtransaction',
  templateUrl: './admindetailtransaction.component.html',
  styleUrls: ['./admindetailtransaction.component.css']
})
export class AdmindetailtransactionComponent implements OnInit {
  order: OrderDetail = <OrderDetail>{};
  refund: RefundDetail = <RefundDetail>{};
  transactionStatus: string = '';
  orderkey: any;
  remarks: string = '';
  _sub; any;
  toggle: boolean = false;
  response: string = "";
  responseClass = '';
  constructor(public activatedRoute: ActivatedRoute, public authService: AuthService,
    public services: ServiceService, public parent: AdminComponent, public sharedService: SharedService,
    public loggerService: LoggerService, public spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.authService.checkLogin().subscribe((uid) => {
      if (uid) {
        this.refund.refundBy = uid;
      }
    })
    this.orderkey = this.activatedRoute.snapshot.paramMap.get("orderkey");
    this.getTransactionData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.parent.pageTitle = "Transaction Summary";
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }

  refundmodel() {
    jQuery("#refundPayment").modal("show")
  }

  inializeRefund() {

    if (this.refund.amount > 0) {
      this.spinner.show();
      this.services.doRefund(this.order, this.refund).then((res) => {
        this.spinner.hide();
        if (res) {
          this.toggle = false;
          this.getTransactionData();
          this.responseClass = 'response-success';
          this.response = "Refund is initiated";
          setTimeout(() => {
            this.response = "";
          }, 5000)
        }
      }).catch((err) => {
        this.spinner.hide();
        this.responseClass = 'response-failed';
        this.response = err;
        setTimeout(() => {
          this.response = "";
        }, 5000)
        let errMessage = "Error processing the refund for uid " + this.refund.uid + " due to reason " + err;
        this.loggerService.log(errMessage);
      })

    } else {
      this.responseClass = 'response-failed';
      this.response = "Please enter a valid amount to refund";
      setTimeout(() => {
        this.response = "";
      }, 5000)
    }
  }
  getTransactionData() {
    this.authService.checkLogin().subscribe((uid) => {
      this._sub = this.services.getDetailTransaction(this.orderkey).subscribe(response => {
        this.order = <OrderDetail>{};
        let orderResponse: any = response[0];
        if (orderResponse) {
          let cardKey = orderResponse.paymentcard;
          this.order['orderNumber'] = orderResponse.ordernumber ? orderResponse.ordernumber : this.orderkey;
          this.order['orderKey'] = this.orderkey;
          this.order.farmKey = orderResponse.farmkey;
          this.order.orderStatus = orderResponse.ordersstatus;
          this.order.remarks = orderResponse.remarks ? orderResponse.remarks : null;
          if (orderResponse.couponapplied != undefined && orderResponse.couponapplied != null) {
            this.services.getCouponDetail(orderResponse.couponapplied, orderResponse.uid).then((coupon) => {
              this.order.discountAmount = coupon[0].discount;
            })
          }
          if (orderResponse['totalrefunds'] != null && orderResponse['totalrefunds'] != undefined) {
            Object.keys(orderResponse['totalrefunds']).map((key, index) => {
              this.remarks = orderResponse['totalrefunds'][key].remarks;
              if (index > 0) {
                this.order.refundAmount = this.order.refundAmount + orderResponse['totalrefunds'][key].amount;
              } else {
                this.order.refundAmount = orderResponse['totalrefunds'][key].amount;
              }
            })
          } else {
            this.remarks = orderResponse.remarks;
          }
          this.refund.chargeId = orderResponse.transactionid;
          this.refund.orderkey = this.orderkey;
          this.authService.getUserInformation(orderResponse.uid).then(user => {
            if (user[0].cards && user[0].cards[cardKey] != undefined && user[0].cards[cardKey] != null) {
              var finalresult = this.sharedService.descryptCardNumber(user[0].cards[cardKey]['number']);
              this.order.cardNumber = "XXXX-XXXX-XXXX-" + finalresult.substr(12, 4);
              this.order.expMonth = user[0].cards[cardKey]['expMonth'];
              this.order.expYear = user[0].cards[cardKey]['expYear'];
            } else {
              this.order.cardNumber = "XXXX-XXXX-XXXX-XXXX";
              this.order.expMonth = 0;
              this.order.expYear = 0;
            }
            this.refund.uid = orderResponse.uid;
            let produces = orderResponse.produces;
            let producesArray = [];
            Object.keys(produces).map((key, index) => {
              Object.keys(produces[key]).map((producekey, index) => {
                let producedesc = produces[key][producekey]['proddesc'];
                let split = producedesc.split(" ");
                produces[key][producekey]['quantityDisp'] = `${produces[key][producekey]['selectedQuantity']} ${split[1]}`;
                producesArray.push(produces[key][producekey]);
              })
            })
            this.order['produces'] = producesArray;
            this.order['price'] = orderResponse.amount / 100;
            this.order['orderDate'] = this.sharedService.getFormattedDateTime(orderResponse.orderdate);
            this.order['pickup1'] = orderResponse.pickup1;
            this.order['pickup2'] = orderResponse.pickup2;
            this.order['pickup3'] = orderResponse.pickup3;
            this.order['customerName'] = user[0].firstname + ' ' + user[0].lastname;
            if (user[0].cards != undefined) {
              let billingAddress = user[0].cards[orderResponse.paymentcard];
              if (billingAddress != undefined && billingAddress != null) {
                this.order['billingAddress1'] = billingAddress.address_line1;
                if (billingAddress.address_line2 != undefined) {
                  this.order['billingAddress1'] = this.order['billingAddress1'] + ' ' + billingAddress.address_line2;
                }
                this.order['billingAddress2'] = billingAddress.address_city + ', ' + billingAddress.address_state + ' ' + billingAddress.postal_code;
              } else {
                this.order['billingAddress1'] = user[0].streetaddress1;
                if (user[0].streetaddress2 != undefined) {
                  this.order['billingAddress1'] = this.order['billingAddress1'] + ' ' + user[0].streetaddress2;
                }
                this.order['billingAddress2'] = user[0].city + ', ' + user[0].state + ' ' + user[0].zipcode;
              }
            } else {
              this.order['billingAddress1'] = user[0].streetaddress1;
              if (user[0].streetaddress2 != undefined) {
                this.order['billingAddress1'] = this.order['billingAddress1'] + ' ' + user[0].streetaddress2;
              }
              this.order['billingAddress2'] = user[0].city + ', ' + user[0].state + ' ' + user[0].zipcode;
            }
          })
        }
      })
    })
  }


  keyPress(event: any) {
    var key = event.keyCode ? event.keyCode : event.which;
    if (key > 45 && key < 58) {
      return true;
    } else if (key == 37 || event.key == "ArrowRight" || key == 8 || key == 46 || key == 9) {
      return true;
    } else {
      return false;
    }

  }
  changeStatus() {
    if (this.transactionStatus == 'Fulfilled') {
      this.toggle = false;
      this.services.markAsFulfilled(this.order['orderKey'], this.refund, "Fulfilled").then((res) => {
        if (res) {
          this.getTransactionData();
        }
      })
    } else {
      this.toggle = true;
    }
  }
  changeToggle() {
    if (this.transactionStatus == 'Refund Pending') {
      this.toggle = true;
    } else {
      this.toggle = false;
    }
  }
  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
  }
}
