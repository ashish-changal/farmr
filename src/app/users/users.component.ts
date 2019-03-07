import { Component } from '@angular/core';
import { FarmsService } from './services/farms.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UserService } from './services/user.service';
import { AuthService } from '../auth/auth.service';
import { CartItems } from '../models/cartitems.model';
import { AngularFireDatabase } from 'angularfire2/database';
import { SharedService } from '../shared.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
declare var jQuery: any;
@Component({
  selector: 'users-root',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  pageTitle = 'users';
  toggle$: Observable<boolean>;
  searchText: string;
  hide: string = "show";
  removedProductId: any;
  notificationCount: number = 0;
  cartItems: CartItems = <CartItems>{};
  cartCountNo: any = 0;
  totalAmount: any = 0.0;
  wishListKey: any;
  userName: string;
  sidemenuText: string;
  uid: any;
  totalPrice = 0;
  items = [];
  farmkey: string;
  _sub: any = [];
  menuActive: boolean = true;
  searchText$: Observable<string>;
  constructor(public sharedService: SharedService, public router: Router,
    public userService: UserService, public authService: AuthService,
    public farmService: FarmsService, public activatedRoute: ActivatedRoute,
    public afDB: AngularFireDatabase) {
  }

  onChange() {
    this.sharedService.changeMessage(this.searchText);
  }


  ngOnInit() {
    this.toggle$ = this.sharedService.isSearchBox;
    this.searchText$ = this.sharedService.searchBoxTextValue;
    this.authService.checkLogin().subscribe((uid) => {
      let setting_sub = this.sharedService.getDefaultAppSettings().subscribe((settings:any)=>{
        if (settings && settings[0].farmmiles) {
          environment.farmMiles = parseInt(settings[0].farmmiles);
        }
        this._sub.push(setting_sub);
      })
      this.authService.getUserInformation(uid).then(res => {
        this.userName = res[0]['firstname'] + " " + res[0]['lastname']
        this.sharedService.sidemenuSelected.subscribe((res) => {
          this.sidemenuText = res;
        })
        this.uid = uid;
        let sub = this.userService.getTotalPendingCartItems(this.uid).subscribe((cartItems) => {
          if (cartItems != null && cartItems != undefined) {
            this.cartCountNo = cartItems['count'];
          }
          this._sub.push(sub);
        })
        let sub1= this.userService.getNotifications(uid).subscribe((notification) => {
          if (notification.length > 0) {
            this.notificationCount = 0;
            Object.keys(notification[0]).map((key)=>{
              if (notification[0][key].readstatus == 0) {
                this.notificationCount++;
              }
            })
          }
          this._sub.push(sub1);
        })
      });
    })
  }


  signout() {
    this.authService.doLogout().then((res) => {
      if (res) {
        this.router.navigate(['/login']);
      }
    })
  }

  openCart() {
    if (this.cartCountNo == 0) {
    }
    else {
      this.userService.getUserWishList(this.uid).take(1).subscribe(res => {

        let totalAmount = 0;
        this.cartItems = <CartItems>{};
        if (res != undefined && res.length > 0 && res != null) {
          this.wishListKey = res[0].key;
          let produces = res[0]['produces'];
          if (produces != null) {
            Object.keys(produces).map((key, index) => {
              let farmsProduces = produces[key];
              this.userService.getSingleFarm(key).then(farm => {
                this.cartItems["farmName"] = farm.name;
                this.cartItems["farmkey"] = key;
                this.cartItems["farmAddress1"] = farm.farmaddress1 + ',' + farm.farmaddress2;
                this.cartItems["farmAddress2"] = farm.city + ' ,' + farm.state + ' ,' + farm.zipcode;
                let stocks = farm.stock;
                let produce = [];
                Object.keys(farmsProduces).map((produceKey, produceIndex) => {
                  if (stocks[produceKey] != null) {
                    farmsProduces[produceKey]['producekey'] = produceKey;
                    farmsProduces[produceKey]['totalquantity'] = stocks[produceKey]['totalquantity'] - farmsProduces[produceKey]["selectedQuantity"] * farmsProduces[produceKey]["unitQuantity"];
                    produce.push(farmsProduces[produceKey]);
                    totalAmount = totalAmount + farmsProduces[produceKey].price * farmsProduces[produceKey].selectedQuantity;
                  }
                })
                this.cartItems['produces'] = produce;
                this.cartItems["totalAmount"] = totalAmount;
                jQuery("#myModal2").modal('show');
              })
            })
          } else {
            this.cartItems = <CartItems>{};
          }
        }
        else {
          this.cartItems = <CartItems>{};
        }
      })
    }
  }
  ngOnDestroy() {
    this._sub.forEach(sub => {
      if (sub != undefined && sub != null) {
        sub.unsubscribe();
      }
    })
  }
  Checkout(key) {
    this.router.navigate(['users/checkout', key]);
  }
  add(key: any) {
    for (let i = 0; i < this.cartItems.produces.length; i++) {
      if (this.cartItems.produces[i].producekey == key) {
        this.cartCountNo++;
        this.cartItems.produces[i].selectedQuantity++;
        this.cartItems.totalAmount = this.cartItems.totalAmount + Math.round(this.cartItems.produces[i].price * 100) / 100;
        this.cartItems.produces[i].totalquantity = this.cartItems.produces[i].totalquantity - this.cartItems.produces[i].unitQuantity;
        this.userService.changeProductQuantity(this.wishListKey, key, this.cartItems["farmkey"], this.cartItems.produces[i].selectedQuantity)
          .then((res) => {
            if (res) {

            } else {

            }
          })
      }
    }
  }
  remove(key: any) {
    for (let i = 0; i < this.cartItems.produces.length; i++) {
      if (this.cartItems.produces[i].producekey == key) {
        this.cartCountNo--
        this.cartItems.produces[i].selectedQuantity--;
        this.cartItems.totalAmount = this.cartItems.totalAmount - Math.round(this.cartItems.produces[i].price * 100) / 100;
        this.cartItems.produces[i].totalquantity = this.cartItems.produces[i].totalquantity + this.cartItems.produces[i].unitQuantity;
        if (this.cartItems.produces[i].selectedQuantity > 0) {
          this.userService.changeProductQuantity(this.wishListKey, key, this.cartItems["farmkey"], this.cartItems.produces[i].selectedQuantity)
            .then((res) => {
              if (res) {

              } else {

              }
            })
        }
        else {
          this.userService.removeProduct(this.wishListKey, key, this.cartItems["farmkey"]);
        }
      }
    }
  }
  removeItem(key: any) {
    this.removedProductId = key;
    jQuery("#myModal3").modal("show");
    jQuery("#myModal2").modal("hide");
  }

  removeItemcart() {
    let key = this.removedProductId;
    this.userService.changeProductQuantity(this.wishListKey, key, this.cartItems["farmkey"], 0).then((res) => {

      if (res) {
        var i = this.cartItems.produces.length;
        while (i--) {
          if (this.cartItems.produces[i]
            && this.cartItems.produces[i].hasOwnProperty('producekey')
            && (this.cartItems.produces[i]['producekey'] === key)) {
            this.cartItems.totalAmount = this.cartItems.totalAmount - Math.round((this.cartItems.produces[i].selectedQuantity * this.cartItems.produces[i].price) * 100) / 100;
            this.cartItems.produces.splice(i, 1);
          }
        }
        if (this.cartItems.produces.length == 0) {
          jQuery("#myModal2").modal('hide');
        }
      }
    })
  }
  emptyMyCart() {
    jQuery("#myModal").modal("show");
    jQuery("#myModal2").modal("hide");
  }

  cardEmpty() {
    this.userService.removeProducesFromWishlist(this.wishListKey).then((res) => {
      if (res) jQuery("#myModal2").modal('hide');
    })
  }

  gotoFarmScreen() {
    this.router.navigate(['users/nearbyfarms/produce', this.cartItems["farmkey"]]);
  }

  clickToggle() {
    this.menuActive = !this.menuActive;
    if (!this.menuActive) {
      this.hide = "hidden";
    }
    else {
      this.hide = "show";
    }
    jQuery('#sidebar').toggleClass('active');
    jQuery('#content').toggleClass('active');
  }
}
