import { Component, OnInit, HostListener } from '@angular/core';
import { UsersComponent } from '../users.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { FarmsService } from '../services/farms.service';
import { CartItems, Card } from '../../models/cartitems.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoggerService } from '../../logger.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  uid: any;
  image = []
  error: string;
  last4Digit: any;
  userName: string;
  wishListKey: any;
  farmkey: string;
  salesTaxPercent: number;
  couponCode: any = '';
  savedCard: any;
  totalAmount: any = 0.0;
  totalAmountWODis: any = 0.0;
  discountedAmount = 0;
  salesTax = {
    tax: 0,
    farmCity: '',
    farmState: '',
    dropzoneCity: '',
    dropzoneState: ''
  }
  cards = [];
  flag = false;
  toggle: boolean = false;
  card: Card = <Card>{};
  farmChoice = false;
  marketChoice = true;
  _sub: any = [];
  cartItems: CartItems = <CartItems>{};
  responseClass: string = ""
  response: string = "";
  farmDetail: any = {};
  autoCardCityValues: any = [];
  invalidCardCity: boolean = false;
  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'), ('DE'), ('FL'), ('GA'),
    ('HI'), ('ID'), ('IL'), ('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'), ('MD'),
    ('MA'), ('MI'), ('MN'), ('MS'), ('MO'), ('MT'), ('NE'), ('NV'), ('NH'), ('NJ'),
    ('NM'), ('NY'), ('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'), ('RI'), ('SC'),
    ('SD'), ('TN'), ('TX'), ('UT'), ('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'), ('WY')

  ];
  constructor(public parent: UsersComponent, public userService: UserService,
    public authService: AuthService, public farmService: FarmsService,
    public activatedRoute: ActivatedRoute, public router: Router,
    public sharedService: SharedService, public spinner: NgxSpinnerService,
    public loggerService: LoggerService
  ) { }

  ngOnInit() {

    this.parent.pageTitle = 'Checkout';

    this.farmkey = this.activatedRoute.snapshot.paramMap.get('farmkey');

    this.authService.checkLogin().subscribe(uid => {
      if (this.sharedService.cityNames.length == 0) {
        this.sharedService.getCitiesName();
      }
      this.uid = uid;
      this.authService.getUserInformation(uid).then(res => {

        this.userName = res[0]['firstname'] + " " + res[0]['lastname']
      })
      this.userService.getSingleFarm(this.farmkey).then(res => {
        this.cartItems["marketname"] = res.marketname;
        this.cartItems["dropzone_address1"] = res.streetdropzone1 + ' ' + res.streetdropzone2;
        this.cartItems["dropzone_address2"] = res.citydropzone + ', ' + res.statedropzone + ' ' + res.zipcodedropzone;
        this.salesTax.dropzoneCity = res.citydropzone;
        this.salesTax.dropzoneState = res.statedropzone;
        this.salesTax.farmCity = res.city;
        this.salesTax.farmState = res.state;
        this.cartItems.pickupOption = res.pickupOption == 'both' ? 'farmrmarket' : res.pickupOption;
        this.cartItems.deliverytime = res.deliverytime;
        this.cartItems.pickup = res.pickupOption;
        this.farmDetail = res;

        let sub1 = this.userService.getAllCards(this.uid).subscribe(card => {

          this.cards = [];
          this.savedCard = card;
          if (card != null && card != undefined) {
            let data: Card = <Card>{};
            this.cartItems['defaultCard'] = card.default ? card.default : '';
            Object.keys(card).map((key) => {
              if (key != 'default') {
                data = <Card>{};
                data = card[key];
                data['key'] = key;
                data.encodedNumber = card[key]['number'];
                var finalresult = this.sharedService.descryptCardNumber(card[key]['number']);
                data['number'] = "XXXX-XXXX-XXXX-" + finalresult.substr(12, 4);;
                this.cards.push(data);
              }
            })
          }
          let sub2 = this.userService.getUserWishList(uid).subscribe(res => {
            let totalAmount = 0;
            if (res != undefined && res.length > 0 && res != null) {
              this.wishListKey = res[0].key;
              let produces = res[0]['produces'];
              if (produces != null) {
                Object.keys(produces).map((key) => {
                  let farmsProduces = produces[key];
                  this.cartItems["farmkey"] = key;
                  this.cartItems["farmAddress1"] = this.farmDetail.farmaddress1 + ' ' + this.farmDetail.farmaddress2;
                  this.cartItems["farmAddress2"] = this.farmDetail.city + ', ' + this.farmDetail.state + ' ' + this.farmDetail.zipcode;
                  this.cartItems["phonenumber"] = '(' + this.farmDetail['phonenumber'].substr(0, 3) + ') ' + this.farmDetail['phonenumber'].substr(3, 3) + '-' + this.farmDetail['phonenumber'].substr(6, 4);
                  let produce = [];
                  Object.keys(farmsProduces).map((produceKey, produceIndex) => {
                    farmsProduces[produceKey]['producekey'] = produceKey;
                    produce.push(farmsProduces[produceKey])
                    totalAmount = totalAmount + farmsProduces[produceKey].price * farmsProduces[produceKey].selectedQuantity;
                  })
                  this.cartItems['produces'] = produce;
                  this.cartItems['totalproduces'] = produce.length;
                  this.totalAmount = totalAmount;
                  this.totalAmountWODis = this.totalAmount;
                  if (this.discountedAmount != 0) {
                    this.totalAmount = (this.totalAmountWODis - this.discountedAmount) < 0 ? 0 : (this.totalAmountWODis - this.discountedAmount);
                  }
                  if (this.cartItems.pickupOption == 'farmrmarket') {
                    this.userService.getState(this.farmDetail['statedropzone'], this.farmDetail['citydropzone']).then(salestax => {
                      if (salestax != undefined && salestax != null) {
                        this.salesTaxPercent = salestax;
                      } else {
                        this.salesTaxPercent = 0;
                      }
                      this.salesTax.tax = this.totalAmountWODis * this.salesTaxPercent / 100;
                    })
                  } else {
                    this.userService.getState(this.farmDetail.state, this.farmDetail.city).then(salestax => {
                      if (salestax != undefined && salestax != null) {
                        this.salesTaxPercent = salestax;
                      } else {
                        this.salesTaxPercent = 0;
                      }
                      this.salesTax.tax = this.totalAmountWODis * this.salesTaxPercent / 100;
                    })
                  }
                })
              }
            }
            this._sub.push(sub2);
          })
          this._sub.push(sub1);
        })
      })
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('');
      this.sharedService.setSearchBox(false);
    })
  }
  ngOnDestroy() {
    this._sub.forEach(sub => {
      if (sub != undefined && sub != null) {
        sub.unsubscribe();
      }
    })
  }

  checkPickup(option) {
    if (option == 'farm') {
      this.marketChoice = false;
      this.farmChoice = true;
      this.userService.getState(this.salesTax.farmState, this.salesTax.farmCity).then(salestax => {
        this.salesTaxPercent = salestax;
        this.salesTax.tax = this.totalAmountWODis * this.salesTaxPercent / 100;
      })
    } else {
      this.marketChoice = true;
      this.farmChoice = false;
      this.userService.getState(this.salesTax.dropzoneState, this.salesTax.dropzoneCity).then(salestax => {
        this.salesTaxPercent = salestax;
        this.salesTax.tax = this.totalAmountWODis * this.salesTaxPercent / 100;
      })
    }
    this.cartItems.pickupOption = option;
  }
  applyCoupon() {
    this.userService.checkCouponDetails(this.couponCode, this.uid).then(res => {
      if (res != 0) {
        this.cartItems['couponapplied'] = this.couponCode;
        this.cartItems['couponkey'] = res.couponkey;
        if (res.discounttype == "%") {
          this.totalAmount = this.totalAmount - this.totalAmount * res.discount / 100;
          this.flag = true;
        } else if (res.discounttype == "$") {
          this.totalAmountWODis = this.totalAmount;
          this.discountedAmount = res.discount;
          this.totalAmount = (this.totalAmount - res.discount) < 0 ? 0 : (this.totalAmount - res.discount);
          this.flag = true;
        }
      } else {
        this.responseClass = "response-failure";
        this.response = "Invalid Copoun";
        setTimeout(() => {
          this.response = "";
        }, 5000)

      }
    })
  }

  removeCoupon() {
    this.cartItems['couponapplied'] = null;
    this.flag = false;
    this.totalAmount = this.totalAmountWODis;
    this.discountedAmount = 0;
    this.couponCode = '';
  }

  placeOrder() {
    this.spinner.show();
    let promises = [];
    for (let i = 0; i < this.cartItems.produces.length; i++) {

      let produce = this.cartItems.produces[i];

      promises.push(this.userService.checkProduceAvailability(this.cartItems.farmkey, produce))
    }
    Promise.all(promises).then((res) => {
      let flag = true;
      for (let i = 0; i < res.length; i++) {
        if (res[i].status == false) {
          this.spinner.hide();
          flag = false;
          window.alert("Some of the items in your cart are no longer available for sale. Please update the cart accordingly");
          break;
        }
      }
      if (flag == true) {
        this.userService.processPayment(this.totalAmount, this.salesTax.tax, this.uid, this.cartItems).then((serverRes) => {
          this.spinner.hide();

          if (serverRes.status) {
            this.responseClass = 'response-success';
            this.response = "Your order has been placed successfully";
            setTimeout(() => {
              this.router.navigate(['users/nearbyfarms']);
            }, 3000)
          } else {
            this.responseClass = 'response-failed';
            this.response = serverRes.message;
            let errMessage = "Error processing the payment for uid " + this.uid + " due to reason " + serverRes.message;
            this.loggerService.log(errMessage);
          }

        }).catch((err) => {
          this.spinner.hide();
          this.responseClass = 'response-failed';
          this.response = "Server Problem while processing the payment try again later";
          setTimeout(() => {
            this.response = "";
          }, 5000)
          let errMessage = "Error processing the payment for uid " + this.uid + " due to reason " + err;
          this.loggerService.log(errMessage);
        })

      }
    })
  }

  setDefaultCard(cardKey) {
    this.userService.setDefaultCard(cardKey, this.uid).then(() => {
      for (let i = 0; i < this.cards.length; i++) {
        if (this.cards[i].key == cardKey)
          this.card = this.cards[i];
      }
    })
  }
  addCardDetail() {
    let cityname = this.sharedService.cityNames.filter((item) => {
      return item.toLowerCase() == this.card.address_city.toLowerCase();
    })
    if (cityname.length == 0) {
      this.invalidCardCity = true;
    } else {
      this.card.date = this.card.expYear + '-' + this.card.expMonth;
      if (this.card['key'] != undefined && this.card['key'] != null && this.card['key'] != "") {
        this.userService.updatePaymentCard(this.card, this.uid).then(() => {
          this.toggle = !this.toggle;
        })
      } else {
        this.userService.addPaymentCard(this.card, this.uid).then(() => {
          this.toggle = !this.toggle;
        });
      }
    }
  }
  selectMonth(val: any) {
    this.card.expMonth = val;
  }
  selectYear(val: any) {
    this.card.expYear = val;
  }
  changeDefaultCard(cardKey: any) {
    this.setDefaultCard(cardKey);
    this.toggle = true;
  }


  addNewCard() {
    this.card = <Card>{};
    let date = this.sharedService.getDatewithTimezone();
    this.card.expMonth = date.getMonth() + 1;
    this.card.expYear = date.getFullYear();
    this.toggle = true;
  }

  _keyPress(event: any) {

    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  autoComplete(val) {
    this.autoCardCityValues = [];
    if (val && val.trim() != "") {
      this.autoCardCityValues = this.sharedService.cityNames.filter((item) => {
        return item.toLowerCase().indexOf(val.toLowerCase()) == 0;
      })
    } else {
      this.autoCardCityValues = [];
    }
  }

  selectItem(value) {
    this.autoCardCityValues = [];
    this.card.address_city = value;
  }

  setDefault() {
    this.invalidCardCity = false;
  }
}