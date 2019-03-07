import { Component, OnInit } from '@angular/core';
import { UsersComponent } from '../users.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FarmsService } from '../services/farms.service';
import { SharedService } from '../../shared.service';
import { CartProduceDetail } from '../../models/cartproducedetail.model';
declare var jQuery: any;
@Component({
  selector: 'app-produce',
  templateUrl: './produce.component.html',
  styleUrls: ['./produce.component.css']
})
export class ProduceComponent implements OnInit {
  farmkey: string;
  uid: any;
  cartItems: any = [];
  produces = <CartProduceDetail[]>[];
  itemsForSearch = <CartProduceDetail[]>[];
  farmname: any;
  noDataFound: string = 'Fetching data...';
  _sub: any = [];
  response: string = "";
  prodduceKey: string;
  responseClass = '';
  constructor(public parent: UsersComponent, public userservices: UserService,
    public authService: AuthService, public router: Router, public activatedRoute: ActivatedRoute,
    public farmsservice: FarmsService, public authservice: AuthService, public sharedService: SharedService) {

    let data = [
      {
        "displayQuantity": 176
      },

      {
        "displayQuantity": 178
      }
    ];

    let p = data[1];
    console.log(p);
    console.log(data.indexOf(data[1]));
  }

  ngOnInit() {
    this.authservice.checkLogin().subscribe(uid => {
      if (uid) {
        this.uid = uid;
        this.activatedRoute.params.subscribe(
          params => {
            this.farmkey = params['farmkey'];
            this.getWishList();
          }
        );
      }
    })
    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.produces = this.itemsForSearch;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != '' && this.produces.length > 0) {
        this.produces = this.produces.filter((item) => {
          return (item.producename.toLowerCase().indexOf(val.toLowerCase()) > -1)
        })
        if (this.produces.length == 0) {
          this.noDataFound = "Sorry no produce found with this name try some another keyword";
        }
      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.parent.pageTitle = 'Produce';
      this.sharedService.selectSidemenu('nearbyfarms');
    })
  }
  ngOnDestroy() {
    this._sub.forEach(sub => {
      sub.unsubscribe();
    })
  }

  getWishList() {
    let cartFarmKey = '';
    let sub1 = this.userservices.getPendingCartItems(this.uid).subscribe(wishlist => {
      if (wishlist.length > 0) {
        let produce = wishlist[0]['produces'];
        if (produce) {
          cartFarmKey = Object.keys(produce)[0];
          let cartProduce = produce[cartFarmKey];
          if (cartProduce != undefined) {
            Object.keys(cartProduce).map((k) => {
              this.cartItems[k] = {
                selectedQuantity: cartProduce[k].selectedQuantity * cartProduce[k].unitQuantity
              }
            })
          }
        }
      }
      this.getFarmProduces(cartFarmKey);
      this._sub.push(sub1);
    })
  }

  getFarmProduces(cartFarmKey: any) {
    let sub2 = this.userservices.getAllProduces(this.farmkey).take(1).subscribe(res => {
      if (res.length > 0) {
        if (res[0].status == 'approved') {
          this.farmname = res[0].name;
          let stock = res[0]['stock'];
          if (stock != undefined) {
            this.sharedService.setSearchBox(true);
            this.sharedService.setSearchBoxText("Search by Order number/Status");
            Object.keys(stock).map((key) => {
              let desc = stock[key].productdesc;
              let unitQuant = +desc.split(" ")[0];
              let produce:CartProduceDetail = {
                producekey: key,
                producename: stock[key].productname,
                productdesc: stock[key].productdesc,
                totalquantity: stock[key].totalquantity,
                displayQuantity: stock[key].totalquantity,
                productprice: stock[key].productprice,
                unitQuantity: unitQuant,
                units: desc.split(" ")[1],
                image: stock[key].image != undefined ? stock[key].image : './assets/imgs/grey.png',
              }
              if (cartFarmKey == this.farmkey) {
                if (this.cartItems[key] != undefined) {
                  produce.displayQuantity = produce.totalquantity - this.cartItems[key].selectedQuantity;
                }
              }
              
              let data = this.produces.filter((produce)=>{
                return produce.producekey == key
              });
              let index = this.produces.indexOf(data[0]);
              if (index > -1) {
                this.produces[index].producename = produce.producename;
                this.produces[index].productdesc = produce.productdesc;
                this.produces[index].totalquantity = produce.totalquantity;
                this.produces[index].displayQuantity = produce.displayQuantity;
                this.produces[index].productprice = produce.productprice;
                this.produces[index].unitQuantity = produce.unitQuantity;
                this.produces[index].units = produce.units;
              }else{
                this.produces.push(produce);
              }
            })
            this.itemsForSearch = this.produces;
          } else {
            this.sharedService.setSearchBox(false);
            this.noDataFound = "No produce found";
          }
          this.produces = this.produces.sort((a, b) => {
            if (a.producename > b.producename) return 1
            else if (a.producename < b.producename) return -1
            else return 0
          })
        }
      } else {
        this.sharedService.setSearchBox(false);
        this.noDataFound = "No produce found";
      }
      this._sub.push(sub2);
    });
  }

  addTocart(produce) {
    let checkoutData = {};
    this.userservices.getTotalPendingCartItems(this.uid).take(1).subscribe(res => {

      if (res['count'] == 0 || res['farmKey'] == this.farmkey) {
        checkoutData[produce.producekey] = {
          image: produce.image,
          productname: produce.producename,
          proddesc: produce.productdesc,
          price: produce.productprice,
          unitQuantity: produce.unitQuantity,
          selectedQuantity: 1,
          totalquantity: produce.totalquantity
        }
        this.prodduceKey = produce.producekey;
        this.userservices.getWishListKey(this.uid).take(1).subscribe(res => {
          if (res != null && res != undefined && res.length > 0) {
            this.userservices.addToUserExistingWishlist(checkoutData, this.activatedRoute.snapshot.paramMap.get("farmkey"), res[0].key).then(res => {
              if (!res.status) {

              }
            })
          } else {
            this.userservices.addToUserNewWishlist(checkoutData, this.activatedRoute.snapshot.paramMap.get("farmkey"), this.uid).then(() => {

              this.responseClass = 'response-success';
              this.response = "";
              setTimeout(() => {
                this.response = "";
              }, 30000)
            })
          }
        })
      } else {
        jQuery("#newModal").modal("show");
      }

    }, err => console.log(err));
  }

  replaceProduce(produce) {

    let checkoutData = {};
    this.userservices.getWishListKey(this.uid).take(1).subscribe(res => {
      let produces = res[0]['produces'];
      if (produces != null) {
        let farmkey = Object.keys(produces)[0];
        produces = produces[farmkey];
        this.userservices.removeProducesFromWishlist(res[0].key).then((response) => {
          checkoutData[produce.producekey] = {
            image: produce.image,
            productname: produce.producename,
            proddesc: produce.productdesc,
            totalquantity: produce.totalquantity,
            price: produce.productprice,
            unitQuantity: produce.unitQuantity,
            selectedQuantity: 1
          }
          this.prodduceKey = produce.prodducekey;

          // this.userservices.holdProduceQuantity(produce.producekey, this.farmkey, (produce.totalquantity - produce.unitQuantity));
          if (response) {
            this.userservices.addToUserExistingWishlist(checkoutData, this.farmkey, res[0].key).then(res => {
              if (res.status) {
                this.responseClass = 'response-success';
                this.response = "Produce Added Sucessfully..!";
                setTimeout(() => {
                  this.response = "";
                }, 30000)
              } else {
                this.responseClass = 'response-failed';
                this.response = res.message;
                setTimeout(() => {
                  this.response = "";
                }, 30000)
              }
            })
          } else {
            this.responseClass = 'response-failed';
            this.response = "Some problem in adding try again in some time";
            setTimeout(() => {
              this.response = "";
            }, 30000)
          }
        }).catch((err) => {
          this.responseClass = 'response-failed';
          this.response = "Some problem in adding try again in some time";
          setTimeout(() => {
            this.response = "";
          }, 30000)
          console.log(err);
        });
      }
    })
  }

}
