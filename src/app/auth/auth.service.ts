import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/take'
import { Headers, Http } from '@angular/http';
import * as firebase from 'firebase';
import { environment } from '../../environments/environment';
@Injectable()
export class AuthService {
  constructor(public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, public route: Router,
    public http: Http) {
  }

  sendMail(data) {
    let header = new Headers();
    header.set("Content-Type", "application/json");
      this.http.post(environment.serverUrl+"sendemail", JSON.stringify(data), { headers: header }).
      subscribe(() => {
      }, err => {
        console.log(`Error is ${JSON.stringify(err)}`);
      });
  }
  doLogin(user): Promise<any> {
    return new Promise((resolve) => {
      //this.afAuth.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
        this.afAuth.auth.signInWithEmailAndPassword(user['email'], user['password']).then(res => {
          if (res.emailVerified) {
            environment.uid = res.uid;
            const user = this.afDB.list('/users', ref => {
              return ref.orderByKey().equalTo(res.uid)
            }).valueChanges(); user.take(1).subscribe(response => {
              resolve({ type: response[0]['usertype'], status: true });
            });
          } else {
            resolve({ message: "Your registered email address has not been verified yet. Please verify your email address", status: false });
          }
        }).catch(err => { resolve({ message: err.message, status: false }); })
     // })
    })
  }
  sendPasswordResetLink(email){
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  reAuthenticate(user): Promise<any> {
    return new Promise((resolve) => {
      this.afAuth.auth.signInWithEmailAndPassword(user['email'], user['oldpassword']).then(res => {
        resolve({ status: true });
      }).catch(err => {
        resolve({ status: false, message: err.message });
      })
    })
  }
  getUserAuthData() {
    return this.afAuth.authState;
  }
  checkLogin() {
    return this.afAuth.authState.take(1).map(res => {
      if (res && res.emailVerified) {
        environment.uid = res.uid;
        return res.uid;
      } else {
        return false;
      }
    });
  }

  checkUserRole(): Promise<any>{
    return new Promise(resolve => {
      this.afAuth.authState.take(1).subscribe(res => {
        if(res){
          this.afDB.list('/users', ref => {
            return ref.orderByKey().equalTo(res.uid)
          }).valueChanges().take(1).subscribe(response => {
            resolve(response[0]['usertype']);
          });
        }else{
          resolve(false);
        }
      })
    })
  }
  updateUserPassword(password): Promise<any> {
    return new Promise((resolve) => {
      const currentUser = this.afAuth.auth.currentUser;
      currentUser.updatePassword(password).then((res) => resolve({ status: true })).catch((err) => {
        resolve({ status: false, message: err.message });
      })
    })
  }

  updateUserEmail(email): Promise<any> {
    return new Promise((resolve) => {
      const currentUser = this.afAuth.auth.currentUser;
      currentUser.updateEmail(email).then((res) => resolve({ status: true })).catch((err) => {
        resolve({ status: false, message: err.message });
      })
    })
  }

  getUserInformation(uid): Promise<any> {
    return new Promise((resolve) => {
      this.afDB.list('/users', ref => {
        return ref.orderByKey().equalTo(uid)
      }).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1).subscribe(response => {
        resolve(response);
      });
    })
  }
  doLogout(): Promise<any> {
    return new Promise((resolve) => {
      this.afAuth.auth.signOut().then(() => {
        resolve(true);
      })
    })
  }

  basicSignUp(user): Promise<any> {
    return new Promise((resolve, reject) => {
      let number = user.phonenumber.replace('(' , '');
      number = number.replace(')' , '');
      number = number.replace(' ' , '');
      number = number.replace('-' , '');
      this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password).then(res => {
        if (res.uid) {
          let currentUser = this.afAuth.auth.currentUser;
          currentUser.updateProfile({ displayName: user.firstname + ' ' + user.lastname, photoURL: null });
          const newUser = this.afDB.list('/users');
          newUser.set(res.uid, {
            createdate: this.getTimeWithTimezone(),
            email: user.email ? user.email : '',
            firstname: user.firstname,
            lastname: user.lastname,
            streetaddress1: user.streetaddress1,
            streetaddress2: user.streetaddress2,
            city: user.city,
            state: user.state,
            usertype: 'basic',
            phonenumber: number,
            zipcode: user.zipcode,
          }).then(() => {
            currentUser.sendEmailVerification();
            resolve({ status: true, uid: res.uid });
          })
        }
      }).catch((err) => {
        reject({ status: false, message: err.message });
      })
    })
  }
  farmerSignUp(user): Promise<any> {
    return new Promise((resolve, reject) => {
      let number = user.phonenumber.replace('(' , '');
      number = number.replace(')' , '');
      number = number.replace(' ' , '');
      number = number.replace('-' , '');
      this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password).then(res => {
        if (res.uid) {
          let currentUser = this.afAuth.auth.currentUser;
          currentUser.updateProfile({ displayName: user.firstname + ' ' + user.lastname, photoURL: null });
          const newUser = this.afDB.list('/users');
          newUser.set(res.uid, {
            createdate: this.getTimeWithTimezone(),
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            usertype: user.usertype,
            streetaddress1: user.streetaddress1,
            streetaddress2: user.streetaddress2,
            city: user.city,
            phonenumber: number,
            state: user.state,
            zipcode: user.zipcode,
          }).then(() => {
            currentUser.sendEmailVerification();
            resolve({ status: true });
          })
        }
      }).catch((err) => {
        reject(err);
      })
    })
  }
  getTimeWithTimezone(){
    let d = new Date();
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000*(-4)));
    return nd.getTime();
  }
  
}
