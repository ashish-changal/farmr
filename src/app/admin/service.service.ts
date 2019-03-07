import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import { FileUpload } from './fileupload';
import { Http, Headers } from '@angular/http';
import * as firebase from 'firebase';
import { environment } from '../../environments/environment';
@Injectable()
export class ServiceService {

  constructor(public afDB: AngularFireDatabase, public afAuth: AngularFireAuth,
    public route: Router, public http: Http) {
      //this.getUsersWithinFarmZipcode("30004");
    }

  private basePath = '/farmsimages';
  
  getTimeWithTimezone(){
    let d = new Date();
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000*(-4)));
    return nd.getTime();
  }

  addNewFarm(fileUpload: FileUpload, newFarm): Promise<any> {
    let number = this.unmaskPhonenumber(newFarm.phonenumber);
    return new Promise((resolve) => {
      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef.child(`${this.basePath}/${newFarm.farmruid}`).put(fileUpload.file);
      let randomNumber = Math.floor((Math.random() * 10000) + 1);
      var key = newFarm.name.replace(' ', '_') + '_' + newFarm.farmruid.substr(0, 6) + randomNumber;
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          const snap = snapshot as firebase.storage.UploadTaskSnapshot
        },
        (error) => {
          console.log(error);
          resolve(false);
        },
        () => {
          // success
          const newUser = this.afDB.list('/farms');
          newUser.set(key, {
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
            farmdesc: newFarm.farmdesc,
            zipcode: newFarm.zipcode,
            farmruid: newFarm.farmruid,
            pickupOption: newFarm.pickup,
            deliverytime: newFarm.deliverytime,
            status: 'pending',
            dateupdated: this.getTimeWithTimezone(),
            createdate: this.getTimeWithTimezone()
          }).then(() => resolve(key)).catch(() => resolve(false))
        }
      );
    })
  }

  getFarmKey(uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/farms", ref => ref.orderByChild("farmruid").equalTo(uid)).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1).subscribe((farm) => resolve(farm));
    })
  }
  getOrdersOfUser(uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/orderlist", ref => ref.orderByChild("uid").equalTo(uid)).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1).subscribe((order) => resolve(order))
    })
  }
  getAllOrders() {
    return this.afDB.list("/orderlist").snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    });
  }
  updatefarm(fileUpload: FileUpload, newfarm): Promise<any> {
    return new Promise((resolve) => {
      let number = this.unmaskPhonenumber(newfarm.phonenumber);
      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef.child(`${this.basePath}/${newfarm.hdn}`).put(fileUpload.file);
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // in progress
          const snap = snapshot as firebase.storage.UploadTaskSnapshot
        },
        (error) => {
          // fail
          console.log(error)
          resolve(false);
        },
        () => {
          // success
          const newUser = this.afDB.list('/farms');
          this.afDB.object('/farms/' + newfarm.hdn)
            .update({
              city: newfarm.city,
              //   dropzone: newfarm.dropzone,
              marketname: newfarm.marketname,
              streetdropzone1: newfarm.streetdropzone1,
              streetdropzone2: newfarm.streetdropzone2,
              citydropzone: newfarm.citydropzone,
              statedropzone: newfarm.statedropzone,
              zipcodedropzone: newfarm.zipcodedropzone,
              farmtype: newfarm.farmtype,
              farmruid: newfarm.farmruid,
              image: uploadTask.snapshot.downloadURL,
              name: newfarm.name,
              phonenumber: number,
              dateupdated: this.getTimeWithTimezone(),
              state: newfarm.state,
              farmdesc: newfarm.farmdesc,
              schedulehours: newfarm['hours'],
              farmaddress1: newfarm.farmaddress1,
              farmaddress2: newfarm.farmaddress2,
              website: newfarm.website,
              zipcode: newfarm.zipcode,
              pickupOption: newfarm.pickup,
              deliverytime: newfarm.deliverytime,
              status: newfarm.status
            }).then(res => resolve(true)).catch(() => resolve(false));
        }
      );
    })
  }


  getAllCoupons() {
    return this.afDB.list("/coupons").snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }))
    })
  }



  getCouponDetail(couponkey, customerUid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list("/coupons/"+customerUid, ref => ref.orderByKey().equalTo(couponkey)).valueChanges().take(1).subscribe((res) => {
        if (res) {
          resolve(res);
        }
      })
    })
  }
  updatewithoutimage(newfarm): Promise<any> {
    return new Promise((resolve) => {
      let number = this.unmaskPhonenumber(newfarm.phonenumber);
      this.afDB.object('/farms/' + newfarm.hdn)
        .update({
          city: newfarm.city,
          marketname: newfarm.marketname,
          farmruid: newfarm.farmruid,
          streetdropzone1: newfarm.streetdropzone1,
          streetdropzone2: newfarm.streetdropzone2,
          citydropzone: newfarm.citydropzone,
          statedropzone: newfarm.statedropzone,
          zipcodedropzone: newfarm.zipcodedropzone,
          farmtype: newfarm.farmtype ? newfarm.farmtype : '',
          name: newfarm.name,
          phonenumber: number,
          state: newfarm.state,
          schedulehours: newfarm['hours'],
          farmaddress1: newfarm.farmaddress1,
          farmaddress2: newfarm.farmaddress2,
          website: newfarm.website,
          zipcode: newfarm.zipcode,
          pickupOption: newfarm.pickup,
          farmdesc: newfarm.farmdesc,
          deliverytime: newfarm.deliverytime,
          status: newfarm.status,
          dateupdated: this.getTimeWithTimezone()

        }).then(res => resolve(true)).catch(() => resolve(false));
    })
  }
  getDetailTransaction(orderkey){
    return this.afDB.list("/orderlist", ref => ref.orderByKey().equalTo(orderkey)).valueChanges();
  }

  getFarms() {
    return this.afDB.list('/farms').snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    });
  }

  orderlist() {
    return this.afDB.list('/orderlist').snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    });

  }
  getUsers() {
    return this.afDB.list('/users').snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    });
  }

  deleteFarm(farmkey): Promise<any> {
    return new Promise(resolve => {
      this.afDB.list('/farms/' + farmkey).remove().then(res => resolve(true),
        err => resolve(false));

    })
  }
  

  doRefund(orderData, refundData): Promise<any> {
    return new Promise((resolve, reject) => {
      let amount = refundData.amount * 100;
      let data = {'orderNumber':orderData.orderNumber, 'remarks': refundData.remarks, 'amount': amount};
      let header = new Headers(); 
      header.append('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'processrefundbyadmin', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().success) {
          resolve(true);
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

  checkRefundStatus(refundid): Promise<any> {
    return new Promise((resolve) => {
      let data = {'refundid' : refundid};
      let header = new Headers();
      header.append('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'refundstatus', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().success) {
          resolve(true);
        } else {

          resolve(false);
        }
      }, (err) => {

        resolve(false);
      })
    })
  }
  markAsFulfilled(orderkey, data, status): Promise<any> {
    return new Promise((resolve) => {
      data.refundBy = this.afAuth.auth.currentUser.uid;
      const order = this.afDB.list("/orderlist");
      order.update(orderkey, {
        dateupdated: this.getTimeWithTimezone(),
        updatedby: data.refundBy,
        remarks: data.remarks,
        ordersstatus: status,
      }).then(() => resolve(true));
    })
  }


  editFarm(user): Promise<any> {
    return new Promise(resolve => {
      this.afDB.list('/farms', ref => ref.orderByKey().equalTo(user)).valueChanges().take(1).subscribe(res => {
        resolve(res);
      })
    })
  }

  approveFarm(farmkey, farmName): Promise<any> {
    return new Promise((resolve) => {
      const farm = this.afDB.list("/farms");
      farm.update(farmkey, { status: "approved" }).then(() => {
        this.afDB.list("/notifications/"+farmkey).push({
          date: this.getTimeWithTimezone(),
          message: "Congratulations! "+farmName+" has been approved to sell produce using Farmr",
          readstatus: 0
        }).then(() => resolve(true));
      }).catch((err) => {
        console.log(err); resolve(false)
      });
    })
  }

  rejectFarm(farmKey, farmName): Promise<any> {
    return new Promise((resolve) => {
      const farm = this.afDB.list("/farms");
      farm.update(farmKey, { status: "rejected" }).then(() => {
        this.afDB.list("/notifications/"+farmKey).push({
          date: this.getTimeWithTimezone(),
          message: "Sorry! Your request to add, "+farmName+" to the system has been denied. Please contact the system admin for further details.",
          readstatus: 0
        }).then(() => resolve(true));
      }).catch((err) => {
        console.log(err); resolve(false)
      });
    })
  }

  getAllNotifications(){
    return this.afDB.list("/notifications", ref => ref.orderByKey().equalTo("admin")).valueChanges()
  }
  readnotifiaction(key): Promise<any> {
    return new Promise((resolve) => {
      const user = this.afDB.list("/notifications/admin");
      user.update(key, {
        readstatus: 1,
      }).then(() => resolve(true)).catch((err) => console.log(err));

    })
  }
  deleteNotification(key){
    this.afDB.list("/notifications/admin/").remove(key);
  }

  generateExcelFile(data){
      let header = new Headers();
      header.append('Content-Type', 'application/json');
      this.http.post(environment.serverUrl+"generateexcel", JSON.stringify(data), { headers: header }).subscribe((res) => {
        if(res.json().status){
          let url:string = res.json().downloadUrl;
          window.location.href = url;
        }
      }, (err) => {
        console.log(err);
      })
  }
  unmaskPhonenumber(number){
    let phonenumber = number.replace('(' , '');
    phonenumber = phonenumber.replace(')' , '');
    phonenumber = phonenumber.replace(' ' , '');
    phonenumber = phonenumber.replace('-' , '');
    return phonenumber;
  }
  
  sendNotification(data): Promise<any>{
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

  getPendingOrdersWithInactiveFarm(farmKey, farmName): Promise<any>{
    return new Promise((resolve) => {
      this.afDB.list("/orderlist", ref=>ref.orderByChild("farmkey").equalTo(farmKey)).valueChanges().take(1)
      .subscribe((orders) => {
        let notifications = [];
        let promises = [];
        let tokens = [];
        orders.forEach((order:any) => {
          if(order.ordersstatus == 'Unfulfilled'){
            notifications.push({
              message: farmName+" is no longer selling produce using farmr. We thrive to add new farms that are in your neighborhood.",
              key: order.uid
            });
            promises.push(this.getUserToken(order.uid));
          }
        })
        Promise.all(promises).then((response)=>{
          if(response.length > 0){
            response.forEach(token=>{
              if(token){
                tokens.push(token);
              }
            })
            if(tokens.length > 0){
              this.sendFCMNotification({
                type: "notification",
                title: "Farmr",
                body: farmName+" is no longer selling produce using farmr. We thrive to add new farms that are in your neighborhood.",
                receivers: tokens
              })
            }
          }
        })
        this.sendNotification(notifications);
      })
      this.afDB.list("/wishlist").snapshotChanges().map(actions=>{
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1)
      .subscribe((wishlist:any) => {
        if(wishlist){
          let notification = [];
          let promises = [];
          let tokens = [];
          wishlist.forEach((snapshot:any)=>{
            if(snapshot.produces != undefined && snapshot.produces != null){
              Object.keys(snapshot.produces).map((key)=>{
                if(key == farmKey){
                  this.afDB.list("/wishlist/").update(snapshot.key,{"produces": null});
                  notification.push({
                    message: farmName+" is no longer selling produce using farmr. We thrive to add new farms that are in your neighborhood.",
                    key: snapshot.uid
                  });
                  promises.push(this.getUserToken(snapshot.uid));
                }
              })
            }
          })
          Promise.all(promises).then((response)=>{
            if(response.length > 0){
              response.forEach(token=>{
                if(token){
                  tokens.push(token);
                }
              })
              if(tokens.length > 0){
                this.sendFCMNotification({
                  type: "notification",
                  title: "Farmr",
                  body: farmName+" is no longer selling produce using farmr. We thrive to add new farms that are in your neighborhood.",
                  receivers: tokens
                })
              }
            }
          })
          if(notification.length > 0){
            this.sendNotification(notification);
          }
        }
      })
    })
  }

  getUserToken(uid):Promise<any>{
    return new Promise((resolve)=>{
      this.afDB.list("/users", ref=>ref.orderByKey().equalTo(uid)).valueChanges().take(1).subscribe((user:any)=>{
        if(user[0].token){
          resolve(user[0].token);
        }else{
          resolve(false);
        }
      }, err=>{
        resolve(false);
      })
    })
  }

  getAppSettings(){
    return this.afDB.list("settings", ref=>ref.orderByKey().equalTo("app-settings")).valueChanges();
  }

  updateAppSettings(appSettings){
    return this.afDB.list("settings").update("app-settings", appSettings);
  }

  authenticateSetting(password): Promise<any>{
    return new Promise((resolve)=>{
      this.afDB.list("settings", ref=>ref.orderByKey().equalTo("password")).valueChanges().take(1).subscribe((res)=>{
        if(password == res[0]){
          resolve(true);
        }else{
          resolve(false);
        }
      })
    })
  }

  getUsersWithinFarmZipcode(zipcode): Promise<any>{
    return new Promise((resolve)=>{
      this.afDB.list("/users", ref=> ref.orderByChild("zipcode").equalTo(zipcode)).valueChanges().take(1)
      .subscribe((users:any)=>{
        let customers = [];
        users.forEach(user=>{
          if(user.usertype == 'basic'){
            
          }
        })
      })
    })
  }
}