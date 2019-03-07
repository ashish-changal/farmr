import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { FileUpload } from '../fileupload';
import * as firebase from 'firebase';
import { Http, Headers } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class FarmrService {

  private produceBasePath = '/producesimages';
  private farmBasePath = '/farmimages';

  constructor(public afDB: AngularFireDatabase, public afAuth: AngularFireAuth,
    public route: Router, public http: Http) { }

  getAllProduce(farmruid) {
    return this.afDB.list("/farms", ref => ref.orderByChild("farmruid").equalTo(farmruid)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    })
  }

  editProduce(producekey, farmkey) {

    return this.afDB.list("/farms", ref => ref.child(farmkey).child('stock').orderByKey().equalTo(producekey))
  }

  getDefaultProduce(): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/produce").snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1).subscribe((produce) => resolve(produce));
    })
  }

  addProduce(fileUpload: FileUpload, produce, farmKey): Promise<any> {
    return new Promise((resolve, reject) => {
      const addProduce = this.afDB.list('/farms', ref => ref.orderByChild('farmruid').equalTo(produce.uid)).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      })
      if (fileUpload != undefined && fileUpload != null) {
        const storageRef = firebase.storage().ref();
        const uploadTask = storageRef.child(`${this.produceBasePath}/${farmKey}/${produce.name}`).put(fileUpload.file);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
            const snap = snapshot as firebase.storage.UploadTaskSnapshot
          },
          (error) => {
            // fail
            reject(error);
          },
          () => {
            // success
            addProduce.take(1).subscribe((res) => {
              const add = this.afDB.list("/farms", ref => ref.child(res[0].key).child("stock"));
              add.push({
                productname: produce.name,
                productdesc: produce.unitquant + " " + produce.unit,
                totalquantity: produce.quantity,
                productprice: produce.price,
                image: uploadTask.snapshot.downloadURL,
                scheduled: produce.scheduled.formatted,
                lowinventory: produce.lowinventory
              }).then(res => resolve(true));
            })
          })
      } else {
        addProduce.take(1).subscribe((res) => {
          const add = this.afDB.list("/farms", ref => ref.child(res[0].key).child("stock"));
          add.push({
            productname: produce.name,
            productdesc: produce.unitquant + " " + produce.unit,
            totalquantity: produce.quantity,
            productprice: produce.price,
            image: produce.image,
            scheduled: produce.scheduled.formatted,
            lowinventory: produce.lowinventory
          }).then(res => resolve(true));
        })
      }
    })
  }

  updatewithoutimage(produce, producekey, farmkey): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list('/farms', ref => ref.child(farmkey).child("stock")).update(producekey, {
        productname: produce.name,
        productdesc: produce.unitquant + " " + produce.unit,
        totalquantity: produce.quantity,
        productprice: produce.price,
        scheduled: produce.scheduled.formatted ? produce.scheduled.formatted : produce.scheduled,
        lowinventory: produce.lowinventory
      }).then(res => {
        this.updateProduceInWishlist(farmkey, producekey, {
          productname: produce.name,
          proddesc: produce.unitquant + " " + produce.unit,
          totalquantity: produce.quantity,
          price: produce.price,
          unitQuantity: produce.unitquant
        })
        resolve(true)
      });
    })
  }

  updateFarmr(farmr): Promise<any> {
    return new Promise((resolve) => {
      let number = this.unmaskPhonenumber(farmr.phonenumber);
      const user = this.afDB.list("/users");
      user.update(farmr.uid, {
        firstname: farmr.firstname,
        lastname: farmr.lastname,
        zipcode: farmr.zipcode,
        phonenumber: number,
        city: farmr.city,
        state: farmr.state,
        streetaddress1: farmr.streetaddress1,
        streetaddress2: farmr.streetaddress2,
        updatedby: farmr.uid,
        dateupdated: this.getTimeWithTimezone()
      }).then(() => resolve(true)).catch((err) => console.log(err));
    })
  }
  getFarm(uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/farms", orderref => orderref.orderByChild("farmruid").equalTo(uid)).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1).subscribe(res => {
        resolve(res);
      })
    })
  }

  getFarmName(uid) {
    return this.afDB.list("/farms", orderref => orderref.orderByChild("farmruid").equalTo(uid)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    })
  }

  getAllFarm() {
    return this.afDB.list("/farms").valueChanges();
  }
  updateproduce(fileUpload: FileUpload, produce, producekey, farmkey): Promise<any> {
    return new Promise((resolve, reject) => {
      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef.child(`${this.produceBasePath}/${farmkey}/${produce.name}`).put(fileUpload.file);
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // in progress
          const snap = snapshot as firebase.storage.UploadTaskSnapshot
        },
        (error) => {
          // fail
          reject(error);
        },
        () => {
          // success
          this.afDB.list("/farms", ref => ref.child(farmkey).child('stock')).update(producekey, {
            productname: produce.name,
            productdesc: produce.unitquant + " " + produce.unit,
            totalquantity: produce.quantity,
            productprice: produce.price,
            image: uploadTask.snapshot.downloadURL,
            scheduled: produce.scheduled.formatted,
            lowinventory: produce.lowinventory
          }).then(res => {
            this.updateProduceInWishlist(farmkey, producekey, {
              productname: produce.name,
              proddesc: produce.unitquant + " " + produce.unit,
              totalquantity: produce.quantity,
              price: produce.price,
              image: uploadTask.snapshot.downloadURL,
            })
            resolve(true)
          });
        }
      );
    })
  }
  updatewithoutimagefarm(newfarm): Promise<any> {
    return new Promise((resolve) => {
      let number = this.unmaskPhonenumber(newfarm.phonenumber);

      const farm = this.afDB.list('/farms');

      farm.update(newfarm.hdn, {
        city: newfarm.city,
        marketname: newfarm.marketname,
        streetdropzone1: newfarm.streetdropzone1,
        streetdropzone2: newfarm.streetdropzone2 ? newfarm.streetdropzone2 : "",
        citydropzone: newfarm.citydropzone,
        statedropzone: newfarm.statedropzone,
        zipcodedropzone: newfarm.zipcodedropzone,
        farmtype: newfarm.farmtype ? newfarm.farmtype : '',
        name: newfarm.name,
        phonenumber: number,
        state: newfarm.state,
        schedulehours: newfarm['hours'],
        farmaddress1: newfarm.farmaddress1,
        farmaddress2: newfarm.farmaddress2 ? newfarm.farmaddress2 : "",
        website: newfarm.website ? newfarm.website : "",
        zipcode: newfarm.zipcode,
        pickupOption: newfarm.pickup,
        deliverytime: newfarm.deliverytime,
        updatedby: newfarm.farmruid,
        dateupdated: this.getTimeWithTimezone(),
      }).then(res => resolve(true)).catch((err) => {

        resolve(false);
      })
    })
  }

  updateProduceInWishlist(farmKey, produceKey, produce) {
    this.afDB.list("/wishlist").snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    }).take(1).subscribe(wishlists => {
      wishlists.forEach(wishlist => {
        if (wishlist.produces) {
          let wishlistFarmKey = Object.keys(wishlist.produces)[0];
          if (farmKey == wishlistFarmKey && wishlist.produces[wishlistFarmKey].hasOwnProperty(produceKey)) {
            this.afDB.list(`/wishlist/${wishlist.key}/produces/${farmKey}`).update(produceKey, produce);
          }
        }
      })
    })
  }

  updatefarm(fileUpload: FileUpload, newfarm): Promise<any> {
    return new Promise((resolve) => {
      let number = this.unmaskPhonenumber(newfarm.phonenumber);
      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef.child(`${this.farmBasePath}/${newfarm.farmruid}`).put(fileUpload.file);
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // in progress
          const snap = snapshot as firebase.storage.UploadTaskSnapshot
        },
        (error) => {
          // fail
          resolve(false)
          console.log(error)
        },
        () => {
          // success
          const newUser = this.afDB.list('/farms');
          this.afDB.object('/farms/' + newfarm.hdn)
            .update({
              city: newfarm.city,
              marketname: newfarm.marketname,
              streetdropzone1: newfarm.streetdropzone1,
              streetdropzone2: newfarm.streetdropzone2,
              citydropzone: newfarm.citydropzone,
              statedropzone: newfarm.statedropzone,
              zipcodedropzone: newfarm.zipcodedropzone,
              farmtype: newfarm.farmtype ? newfarm.farmtype : '',
              image: uploadTask.snapshot.downloadURL,
              name: newfarm.name,
              phonenumber: number,
              state: newfarm.state,
              schedulehours: newfarm['hours'],
              farmaddress1: newfarm.farmaddress1,
              farmaddress2: newfarm.farmaddress2,
              website: newfarm.website,
              zipcode: newfarm.zipcode,
              pickupOption: newfarm.pickup,
              deliverytime: newfarm.deliverytime,
              updatedby: newfarm.farmruid,
              dateupdated: this.getTimeWithTimezone()
            }).then(res => resolve(true)).catch((err) => {
              console.log(err);
              resolve(false);
            })
        });
    })
  }


  deleteProduce(producekey, farmkey): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list('/farms', ref => ref.child(farmkey).child("stock")).remove(producekey)
        .then((res) => { resolve(true) }).catch((err) => { resolve(false) });
    })
  }

  deleteProduceFromWishlist(produceKey, farmKey) {
    this.afDB.list("/wishlist").snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    }).take(1).subscribe(wishlists => {
      wishlists.forEach(wishlist => {
        if (wishlist.produces) {
          let wishlistFarmKey = Object.keys(wishlist.produces)[0];
          if (farmKey == wishlistFarmKey && wishlist.produces[wishlistFarmKey].hasOwnProperty(produceKey)) {
            this.afDB.list(`/wishlist/${wishlist.key}/produces/${farmKey}`).remove(produceKey);
          }
        }
      })
    })
  }

  addFarm(fileUpload: FileUpload, newFarm): Promise<any> {
    return new Promise((resolve) => {
      let number = this.unmaskPhonenumber(newFarm.phonenumber);
      let randomNumber = Math.floor((Math.random() * 10000) + 1);
      var key = newFarm.name.replace(' ', '_') + '_' + newFarm.farmruid.substr(0, 6) + randomNumber;
      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef.child(`${this.farmBasePath}/${newFarm.farmruid}`).put(fileUpload.file);
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // in progress
          const snap = snapshot as firebase.storage.UploadTaskSnapshot
        },
        (error) => {
          // fail
          resolve(false);
          console.log(error)
        },
        () => {
          // success
          const farm = this.afDB.list('/farms');
          farm.set(key, {
            city: newFarm.city,
            marketname: newFarm.marketname,
            streetdropzone1: newFarm.streetdropzone1,
            streetdropzone2: newFarm.streetdropzone2,
            citydropzone: newFarm.citydropzone,
            statedropzone: newFarm.statedropzone,
            zipcodedropzone: newFarm.zipcodedropzone,
            farmtype: newFarm.farmtype,
            image: uploadTask.snapshot.downloadURL,
            name: newFarm.name,
            phonenumber: number,
            state: newFarm.state,
            schedulehours: newFarm['hours'],
            farmaddress1: newFarm.farmaddress1,
            farmaddress2: newFarm.farmaddress2,
            website: newFarm.website,
            zipcode: newFarm.zipcode,
            farmruid: newFarm.farmruid,
            pickupOption: newFarm.pickup,
            deliverytime: newFarm.deliverytime,
            farmdesc: newFarm.farmdesc,
            status: "pending",
            dateupdated: this.getTimeWithTimezone(),
            createdate: this.getTimeWithTimezone()
          }).then(() => {
            resolve(key)
          }).catch(()=>{
            resolve(false);
          })
        }
      );
    })
  }
  getFarmKey(farmruid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/farms", ref => ref.orderByChild("farmruid").equalTo(farmruid)).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      })
        .take(1).subscribe(farms => {
          if (farms.length > 0) {
            resolve(farms[0]['key']);
          } else {
            resolve(false);
          }
        })
    })
  }
  getCouponDetail(couponkey, uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/coupons/"+uid, ref => ref.orderByKey().equalTo(couponkey)).valueChanges().take(1).subscribe((res) => {
        if (res) {
          resolve(res);
        }
      })
    })
  }
  getAllOrders(farmkey) {
    return this.afDB.list("/orderlist", orderref => orderref.orderByChild("farmkey").equalTo(farmkey)).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    });
  }
  getDetailTransaction(orderkey) {
    return this.afDB.list("/orderlist", ref => ref.orderByKey().equalTo(orderkey)).valueChanges();
  }

  markAsFulfilled(orderkey, remark, updatedBy): Promise<any> {
    return new Promise((resolve) => {
      const order = this.afDB.list("/orderlist");
      order.update(orderkey, {
        dateupdated: this.getTimeWithTimezone(),
        updatedby: updatedBy,
        ordersstatus: "Fulfilled",
        remarks: remark
      }).then(() => resolve(true)).catch((err) => {
        resolve(false)
      })
    })
  }

  getFarmNotifications(farmkey) {
    return this.afDB.list("/notifications", ref => ref.orderByKey().equalTo(farmkey)).valueChanges()
  }

  readnotifiaction(key, farmKey): Promise<any> {
    return new Promise((resolve) => {
      const user = this.afDB.list("/notifications/"+farmKey);
      user.update(key, {
        readstatus: 1,
      }).then(() => resolve(true)).catch((err) => console.log(err));
    })
  }
  deleteNotification(key, farmKey){
    this.afDB.list("/notifications/"+farmKey).remove(key);
  }

  sendFCMNotification(data): Promise<any>{
    return new Promise((resolve, reject) => {
      let header = new Headers();
      header.set('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'sendnotification', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().status) {
          resolve({ status: true });
        }
      }, (err) => {
        console.log(err);
        throw new Error(err);
      })
    })
  }

  unmaskPhonenumber(number) {
    let phonenumber = number.replace('(', '');
    phonenumber = phonenumber.replace(')', '');
    phonenumber = phonenumber.replace(' ', '');
    phonenumber = phonenumber.replace('-', '');
    return phonenumber;
  }
  getTimeWithTimezone(){
    let d = new Date();
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000*(-4)));
    return nd.getTime();
  }

}