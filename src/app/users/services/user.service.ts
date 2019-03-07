import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { NgxStripeModule, StripeService } from 'ngx-stripe';
import { Headers, Http } from '@angular/http';
import { environment } from '../../../environments/environment';
import { Card } from '../../models/cartitems.model';

declare var Stripe: any;
@Injectable()
export class UserService {
  uid: any;
  constructor(public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public route: Router,
    public stripe: NgxStripeModule,
    private http: Http,
    public stripeSerivce: StripeService

  ) {

    Stripe.setPublishableKey(environment.stripeKey);

  }

  getUserAddress(uid): Promise<any> {

    return new Promise(resolve => {
      this.afDB.list("/users", ref => ref.orderByChild("uid").equalTo(uid)).valueChanges().take(1)
        .subscribe(res => {
          resolve(res[0]['zipcode']);
        })
    })
  }

  updateUserProfile(number, userData, uid): Promise<any> {
    userData.phonenumber = number;
    return new Promise((resolve) => {

      const userUpdate = this.afDB.list("/users");
      if (userData.defaultcard != "" && userData.defaultcard != null && userData.defaultcard != undefined) {
        userUpdate.update(uid, {
          firstname: userData.firstname,
          lastname: userData.lastname,
          streetaddress1: userData.streetaddress1,
          streetaddress2: userData.streetaddress2,
          city: userData.city,
          state: userData.state,
          zipcode: userData.zipcode,
          phonenumber: userData.phonenumber,
          'cards/default': userData.defaultcard,
          updatedby: uid,
          dateupdated: this.getTimeWithTimezone()
        }).then(() => resolve(true)).catch(() => resolve(false))
      } else {
        userUpdate.update(uid, {
          firstname: userData.firstname,
          lastname: userData.lastname,
          streetaddress1: userData.streetaddress1,
          streetaddress2: userData.streetaddress2,
          city: userData.city,
          state: userData.state,
          zipcode: userData.zipcode,
          phonenumber: userData.phonenumber,
          updatedby: uid,
          dateupdated: this.getTimeWithTimezone()
        }).then(() => resolve(true)).catch(() => resolve(false))
      }
    })
  }
  getUserWishList(uid) {
    return this.afDB.list("/wishlist", ref => ref.orderByChild("uid").equalTo(uid)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    })
  }

  getAllProduces(farmkey) {
    return this.afDB.list('/farms', ref => ref.orderByKey().equalTo(farmkey)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    })
  }

  getAllCards(uid) {
    return this.afDB.list("/users", ref => ref.orderByKey().equalTo(uid)).valueChanges().map(res => {
      return res[0]['cards'];
    })
  }

  setDefaultCard(cardKey, uid): Promise<any> {
    return new Promise((resolve) => {
      const updateDefaultCard = this.afDB.list("/users", ref => ref.child(uid).child("cards"));
      updateDefaultCard.set("default", cardKey).then(() => resolve(true));
    })
  }
  getWishListKey(uid) {

    this.uid = uid;
    const wishlist = this.afDB.list("/wishlist", ref => ref.orderByChild("uid").equalTo(uid)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    })
    return wishlist.take(1).map(res => {
      return res;
    })
  }

  getDetailTransaction(orderkey): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/orderlist", ref => ref.orderByKey().equalTo(orderkey)).valueChanges()
        .take(1).subscribe(response => {
          resolve(response[0]);
        })
    })
  }

  addToUserExistingWishlist(produces, farmkey, wishlistkey): Promise<any> {
    return new Promise((resolve) => {
      let uid = this.afAuth.auth.currentUser.uid;
      const wishList = this.afDB.list("/wishlist/", ref => ref.child(wishlistkey).child("produces").orderByKey().equalTo(farmkey));
      return wishList.valueChanges().take(1).subscribe(response => {

        if (response != null && response != undefined && response.length > 0) {
          Object.keys(produces).map((key, index) => {
            let ref = farmkey + "/" + key;
            if (response[0][key] != null && response[0][key] != undefined) {
              let updatedQuantity = response[0][key].selectedQuantity + produces[key].selectedQuantity;
              if (updatedQuantity > produces[key].totalquantity) {
                resolve({ status: false, message: "Sorry you can't add produce more than it's total quantity" });
              } else {
                wishList.update(ref, { 
                  selectedQuantity: updatedQuantity
                }).then(() => {
                  // this.afDB.list("/wishlist").update(wishlistkey, {
                  //   updatedby: uid,
                  //   dateupdated: this.getTimeWithTimezone()
                  // })
                  resolve({ status: true, message: "Produce added successfuly" });
                }).catch((err) => {
                  resolve({ status: false, message: "Some error in adding the produce pleasse try again later" });
                  console.log(err);
                })
              }
            } else {
              wishList.update(ref, produces[key]).then(() => {
                // this.afDB.list("/wishlist").update(wishlistkey, {
                //   updatedby: uid,
                //   dateupdated: this.getTimeWithTimezone()
                // })
                resolve({ status: true, message: "Produce added successfuly" });
              }).catch((err) => {
                resolve({ status: false, message: "Some error in adding the produce pleasse try again later" });
                console.log(err);
              })
            }
          })
        } else {
          this.afDB.list("/wishlist/", ref => ref.child(wishlistkey).child("produces")).set(farmkey, produces).then(() => {
            // this.afDB.list("/wishlist").update(wishlistkey, {
            //   updatedby: uid,
            //   dateupdated: this.getTimeWithTimezone()
            // })
            resolve({ status: true, message: "Produce added successfuly" });
          }).catch((err) => {
            resolve({ status: false, message: "Some error in adding the produce pleasse try again later" });
            console.log(err);
          })
        }
      })
    })
  }

  getOrderlist(uid) {
    return this.afDB.list("/orderlist", ref => ref.orderByChild("uid").equalTo(uid)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    });
  }
  addToUserNewWishlist(produces, farmkey, uid) {
    this.uid = uid;
    let updationData = {};
    updationData[farmkey] = produces;
    const wishList = this.afDB.list("/wishlist");
    return wishList.push({
      uid: this.uid,
      produces: updationData,
      datecreated: this.getTimeWithTimezone()
    })
  }

  getPendingCartItems(uid) {
    return this.afDB.list("/wishlist", ref => ref.orderByChild("uid").equalTo(uid)).valueChanges();
  }

  getTotalPendingCartItems(uid) {

    return this.afDB.list("/wishlist", ref => ref.orderByChild("uid").equalTo(uid)).valueChanges().map((res) => {
      if (res.length > 0) {
        let produces = res[0]['produces'];
        let cartItems = {};
        let count = 0;
        if (produces != null) {
          Object.keys(produces).map((key, index) => {
            Object.keys(produces[key]).map((produceKey, i) => {
              count = count + produces[key][produceKey].selectedQuantity;
            })
            cartItems = {
              count: count,
              farmKey: key
            }
          })
          return cartItems;
        } else return { count: 0 };
      } else {
        return { count: 0 };
      }
    })
  }
  removeProducesFromWishlist(wishlistKey: any): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/wishlist", ref => ref.child(wishlistKey)).remove("produces")
        .then((res) => { resolve(true) }).catch((err) => { resolve(false) });
    })
  }

  holdProduceQuantity(produceKey, farmKey, selectedQuantity: number): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list('/farms', ref => ref.child(farmKey).child("stock").orderByKey().equalTo(produceKey))
        .valueChanges().take(1).subscribe((res) => {
          let remainingQuantity = res[0]['totalquantity'] - selectedQuantity;
          const produce = this.afDB.list('/farms', ref => ref.child(farmKey).child("stock"));
          produce.update(produceKey, { "totalquantity": remainingQuantity }).then(() => resolve(true));
        })
    })
  }


  changeProductQuantity(wishlistKey, productKey, farmKey, quantity): Promise<any> {
    return new Promise((resolve) => {
      const wishList = this.afDB.list("/wishlist", ref => ref.child(wishlistKey).child('produces').child(farmKey));
      if (quantity > 0) {
        wishList.update(productKey, { selectedQuantity: quantity }).then(() => resolve(true)).
          catch(() => resolve(false));
      } else {
        wishList.remove(productKey).then(() => resolve(true)).
          catch(() => resolve(false));
      }
    })
  }


  removeProduct(wishlistKey, productKey, farmKey) {
    const wishList = this.afDB.list("/wishlist", ref => ref.child(wishlistKey).child('produces').child(farmKey));
    wishList.valueChanges().take(1).subscribe(res => {
      if (res.length > 1) {
        wishList.remove(productKey);
      } else {
        this.afDB.list("/wishlist").remove(wishlistKey);
      }
    });
  }

  getSingleFarm(key): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list('/farms', ref => ref.orderByKey().equalTo(key)).valueChanges().
        take(1).subscribe(res => {
          resolve(res[0]);
        })
    })
  }
  getState(state, city): Promise<any> {

    return new Promise((resolve) => {
      this.afDB.list('/servicetax', ref => ref.child(state).orderByKey().equalTo(city)).valueChanges().
        take(1).subscribe(res => {

          resolve(res[0]);
        })
    })
  }

  checkCouponDetails(couponCode, uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/coupons/" + uid, ref => ref.orderByChild("code").equalTo(couponCode)).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).take(1).subscribe(res => {
        if (res != null && res != undefined && res.length > 0) {
          if (res[0].applied == 'no') {
            let datetime = this.getTimeWithTimezone();
            if (datetime <= res[0]['expiredate'] && datetime >= res[0]['issuedate']) {
              resolve({ couponkey: res[0].key, discount: res[0].discount, discounttype: res[0].discounttype });
            } else resolve(0);
          } else resolve(0);
        } else resolve(0);
      })
    })
  }

  getCouponDetail(couponkey, uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/coupons/" + uid, ref => ref.orderByKey().equalTo(couponkey)).valueChanges().take(1).subscribe((res) => {
        if (res) {
          resolve(res);
        }
      })
    })
  }

  addPaymentCard(data, uid): Promise<any> {
    let card = Object.assign({}, data);
    card.number = this.encryptCardNumber(data.number);
    return new Promise((resolve) => {
        let user = this.afDB.list('/users/', ref => ref.child(uid).child("cards"));
        user.push(card).then(() => {
          this.afDB.list('/users/').update(uid, {
            updatedby: uid,
            dateupdated: this.getTimeWithTimezone()
          })
          resolve(true);
        });
    })
  }

  updatePaymentCard(data: Card, uid): Promise<any> {
    let card = Object.assign({}, data);
    if (card.number.indexOf('X') > -1) {
      card.number = card.encodedNumber;
    } else {
      card.number = this.encryptCardNumber(card.number);
    }
    return new Promise((resolve) => {
      let key = card.key;
      card.key = null;
      card.encodedNumber = null;
      let user = this.afDB.list('/users/', ref => ref.child(uid));
      user.update("cards", { [key]: card, default: key }).then(() => {
        this.afDB.list('/users/').update(uid, {
          updatedby: uid,
          dateupdated: this.getTimeWithTimezone()
        })
        resolve(true);
      });
    })
  }

  deletePaymentCard(uid, cardKey){
    return this.afDB.list("/users", ref=>ref.child(uid).child("cards")).remove(cardKey);
  }

  removeDefaultCard(uid){
    return this.afDB.list("/users", ref=>ref.child(uid).child("cards")).remove("default");
  }
  getUserProfile(uid){
    return this.afDB.list("/users", ref => ref.orderByKey().equalTo(uid)).valueChanges();
  }
  checkProduceAvailability(farmkey, produce): Promise<any> {

    return new Promise((resolve) => {

      this.afDB.list("/farms", ref => ref.child(farmkey).child('stock').orderByKey().equalTo(produce.producekey)).valueChanges().
        take(1).subscribe((data) => {
          if (data[0]['totalquantity'] != "undefined") {
            if (data[0]['totalquantity'] >= (produce.selectedQuantity * produce.unitQuantity)) {
              resolve({ status: true });
            } else {
              resolve({ status: false, producekey: produce.producekey });
            }
          }
      })
    })
  }
  processPayment(amount, tax, uid, cartItems): Promise<any> {
    
    return new Promise((resolve, reject) => {
      this.afDB.list('/users/', ref => ref.orderByKey().equalTo(uid)).valueChanges().take(1).subscribe(res => {
        if (res[0]['cards'] && res[0]['cards']['default']) {
          let defaultCard = res[0]['cards']['default'];
          if (defaultCard != null && defaultCard != undefined) {
            let carddetails = res[0]['cards'][defaultCard];
            var getcardValue = carddetails['number'];
            let decrypted = atob(getcardValue);
            var finalresult = decrypted.substr(3, 5) + decrypted.substr(13, 4) + decrypted.substr(21, 6) + decrypted.substr(30, 1);
            var decryptCardNumber = finalresult.substr(0, 4) + '-' + finalresult.substr(4, 4) + '-' + finalresult.substr(8, 4) + '-' + finalresult.substr(12, 4);
            let card = {
              number: decryptCardNumber,
              expMonth: carddetails.expMonth,
              expYear: carddetails.expYear,
              cvc: carddetails.cvc,
              name: carddetails.name,
              address_line1: carddetails.address_line1,
              postal_code: carddetails.postal_code
            };
            Stripe.createToken({
              number: decryptCardNumber,
              exp_month: card.expMonth,
              exp_year: card.expYear,
              cvc: carddetails.cvc
            }, (status: number, response: any) => {
              if (status === 200) {
                let cartItemPostData = Object.assign({}, cartItems);
                cartItemPostData['tax'] = tax;
                cartItemPostData['defaultCard'] = defaultCard;
                cartItemPostData['produces'] = null;
                cartItemPostData['amount'] = amount;
                this.doPayment(response.id, cartItemPostData, uid).then((stripeRes) => {
                  if (stripeRes.success) {
                    resolve({ status: true, message: "Payment Successfull"});
                  } else {
                    resolve({ status: false, message: "System error. Please try again after sometime Or contact system admin at contact@localfarmr.com" });
                  }
                }).catch((err) => {
                  let resBody = JSON.parse(err['_body']);
                  reject(resBody.message);
                })
              } else {
                resolve({ status: false, message: response.error.message });
              }
            });
          } else {
            resolve({ status: false, message: "Please select the card from which you want to make payment." });
          }
        } else {
          resolve({ status: false, message: "Payment card details are missing" });
        }
      }, err => {
        resolve({ status: false, message: "Check your internet connection or try again later" });
      });
    })
  }

  doPayment(token, cartItems, uid): Promise<any> {
    return new Promise((resolve, reject) => {
      let data = { 'token': token, orderdetails: cartItems, uid: uid };
      let header = new Headers();
      header.append('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'processpay', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().success) {
          console.log(res.json())
          resolve({ success: true});
        } else {
          reject(res);
        }
      }, (err) => {
        resolve({ success: false });
        throw new Error(err);
      })
    })
  }

  cancelOrder(orderNumber, transactionid): Promise<any> {
    return new Promise((resolve, reject) => {
      let data = { 'chargeId': transactionid, 'orderNumber': orderNumber };
      let header = new Headers();
      header.append('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'processrefund', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().success) {
          console.log(res.json());
          resolve(true)
        } else {
          let resBody = JSON.parse(res['_body']);
          reject(resBody.message);
        }
      }, (err) => {
        reject("Server is busy try again in some time");
        throw new Error(err);
      })
    })
  }

  getAllCoupons(uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/coupons", ref => ref.orderByKey().equalTo(uid)).valueChanges()
        .take(1).subscribe((coupons) => {
          resolve(coupons)
        })
    })
  }

  getNotifications(uid) {
    return this.afDB.list("/notifications", ref => ref.orderByKey().equalTo(uid)).valueChanges();
  }

  readnotifiaction(key, uid): Promise<any> {
    return new Promise((resolve) => {
      const user = this.afDB.list("/notifications/"+uid);
      user.update(key, {
        readstatus: 1,
      }).then(() => resolve(true)).catch((err) => console.log(err));

    })
  }
  deleteNotification(key){
    let uid = this.afAuth.auth.currentUser.uid;
    this.afDB.list("/notifications/"+uid).remove(key);
  }

  encryptCardNumber(number: any) {
    let cardNumber = number.replace('-', '');
    cardNumber = cardNumber.replace('-', '');
    cardNumber = cardNumber.replace('-', '');
    var someRandomValue = Math.random().toString().slice(2, 11);
    let encryptValue = btoa(someRandomValue.substr(0, 3) + cardNumber.substr(0, 5) + someRandomValue.substr(3, 5) + cardNumber.substr(5, 4) + someRandomValue.substr(2, 4) + cardNumber.substr(9, 6) + someRandomValue.substr(5, 3) + cardNumber.substr(15, 1));
    return encryptValue;
  }

  sendNotification(data): Promise<any> {
    return new Promise((resolve, reject) => {
      let header = new Headers();
      header.set('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'addnotification', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().status) {
          resolve({ status: true });
        }
      }, (err) => {
        reject({ status: false });
        throw new Error(err);
      })
    })
  }

  sendEmail(data): Promise<any> {
    return new Promise((resolve, reject) => {
      let header = new Headers();
      header.set('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'sendemail', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().status) {
          resolve({ status: true });
        }
      }, (err) => {
        reject({ status: false });
        throw new Error(err);
      })
    })
  }
  getTimeWithTimezone() {
    let d = new Date();
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000 * (-4)));
    return nd.getTime();
  }

  getNearbyFarms(data):Promise<any>{
    return new Promise((resolve, reject)=>{
      let header = new Headers();
        header.set("Content-Type" , "application/json")
        this.http.post(environment.serverUrl+'getfarms',JSON.stringify(data),{headers: header}).
        subscribe( res =>{
          if(res.json().success){
            resolve(res.json().data);
          }else{
            reject(res.json().message);
          }
        }, err => {
            console.log(err.json());
            reject(err.json().message);
        });
    })
  }

}

