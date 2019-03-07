import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FarmrService } from '../services/farmr.service';
import { AuthService } from '../../auth/auth.service';
import { OrderDetail, RefundDetail } from '../../models/detailtransaction.model';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-farmdetailtransaction',
  templateUrl: './farmdetailtransaction.component.html',
  styleUrls: ['./farmdetailtransaction.component.css']
})

export class FarmdetailtransactionComponent implements OnInit {

  order: OrderDetail = <OrderDetail>{};
  transactionStatus: string = '';
  uid: any;
  orderkey: any;
  remarks: any;
  comments: any;
  response: string = "";
  responseClass = '';
  _sub: any;

  constructor(public activatedRoute: ActivatedRoute, public farmrService: FarmrService,
    public authService: AuthService, public parent: FarmrComponent,
    public sharedService: SharedService) { }

  ngOnInit() {

    this.parent.pageTitle = "Transaction Summary";
    this.authService.checkLogin().subscribe((uid) => {
      if (uid) {
        this.uid = uid;
      }
    })
    this.orderkey = this.activatedRoute.snapshot.paramMap.get("orderkey");
    this.getTransactionDetail();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('transactions');
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
    })
  }

  changeStatus() {
    this.farmrService.markAsFulfilled(this.orderkey, this.comments, this.uid).then((res) => {
      if (res) {
        this.responseClass = 'response-success';
        this.response = "Updated Successfully";
        this.getTransactionDetail();
      } else {
        this.responseClass = 'response-failed';
        this.response = "Some problem in updation try again later";
      }
      setTimeout(() => {
        this.response = "";
      }, 5000)
    })
  }
  getTransactionDetail() {
    this.authService.checkLogin().subscribe((uid) => {
      this._sub = this.farmrService.getDetailTransaction(this.orderkey).subscribe(response => {
        let orderResponse: any = response[0];
        if (orderResponse) {
          this.order['orderNumber'] = orderResponse.ordernumber ? orderResponse.ordernumber : this.orderkey;
          this.order.orderStatus = orderResponse.ordersstatus;

          if (orderResponse.couponapplied != undefined && orderResponse.couponapplied != null) {
            this.farmrService.getCouponDetail(orderResponse.couponapplied, orderResponse.uid).then((coupon) => {
              this.order.discountAmount = coupon[0].discount;
            })
          }
          if (orderResponse['totalrefunds'] != null && orderResponse['totalrefunds'] != undefined) {
            Object.keys(orderResponse['totalrefunds']).map((key, index) => {
              if (index > 0) {
                this.remarks = orderResponse['totalrefunds'][key].remarks;

                this.order.refundAmount = this.order.refundAmount + orderResponse['totalrefunds'][key].amount;
              } else {
                this.remarks = orderResponse['totalrefunds'][key].remarks;
                this.order.refundAmount = orderResponse['totalrefunds'][key].amount;
              }
            })
          }

          this.transactionStatus = orderResponse.ordersstatus == 'Fulfilled' ? 'Fulfilled' : "";
          this.authService.getUserInformation(orderResponse.uid).then(user => {
            let produces = orderResponse.produces;
            let producesArray = [];
            Object.keys(produces).map((key) => {
              Object.keys(produces[key]).map((producekey) => {
                let producedesc = produces[key][producekey]['proddesc'];
                let split = producedesc.split(" ");
                produces[key][producekey]['quantityDisp'] = `${produces[key][producekey]['selectedQuantity']} ${split[1]}`;
                produces[key][producekey]['image'] = produces[key][producekey]['image'];
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

  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
  }
}
