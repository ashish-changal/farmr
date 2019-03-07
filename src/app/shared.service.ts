import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFireDatabase } from 'angularfire2/database';
import { environment } from '../environments/environment';

@Injectable()
export class SharedService {

  private search = new BehaviorSubject<string>("");
  private searchBox = new BehaviorSubject<boolean>(true);
  private searchBoxText = new BehaviorSubject<string>("Search");
  private add = new BehaviorSubject<boolean>(false);
  private clearObject = new BehaviorSubject<boolean>(false);
  private sidemenuObject = new BehaviorSubject<string>("dashboard");
  public cityNames = [];

  clearObjectdata = this.clearObject.asObservable();
  addProduceShow = this.add.asObservable();
  isSearchBox = this.searchBox.asObservable();
  currentSearch = this.search.asObservable();
  searchBoxTextValue = this.searchBoxText.asObservable();
  sidemenuSelected = this.sidemenuObject.asObservable();

  constructor(public afDB: AngularFireDatabase, public http: Http) {
    this.getCitiesName();
  }

  selectSidemenu(val) {
    this.sidemenuObject.next(val);
  }
  changeMessage(searchKey: string) {
    this.search.next(searchKey)
  }

  setSearchBox(val) {
    this.searchBox.next(val);
  }

  setSearchBoxText(val) {
    this.searchBoxText.next(val);
  }

  setProduceButtonValue(val) {
    this.add.next(val);
  }

  setClearData(val) {
    this.clearObject.next(val);
  }

  descryptCardNumber(cardNumber) {
    let decrypted = atob(cardNumber);
    var finalresult = decrypted.substr(3, 5) + decrypted.substr(13, 4) + decrypted.substr(21, 6) + decrypted.substr(30, 1);
    return finalresult;
  }
  unmaskPhonenumber(number) {
    let phonenumber = number.replace('(', '');
    phonenumber = phonenumber.replace(')', '');
    phonenumber = phonenumber.replace(' ', '');
    phonenumber = phonenumber.replace('-', '');
    return phonenumber;
  }

  getFormattedDate(time) {
    let date = new Date(time);

    let month: any = date.getMonth() + 1;
    let day: any = date.getDate();
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    return (month + '/' + day + '/' + date.getFullYear());
  }

  getCitiesName() {
    return new Promise((resolve) => {
      this.afDB.list('/servicetax', ref => ref.child("GA")).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }))
      }).take(1).subscribe(cities => {
        let cityNames = [];
        cities.forEach((city) => {
          cityNames.push(city.key);
        })
        this.cityNames = cityNames;
        resolve(this.cityNames);
      })
    })
  }

  getFormattedDateTime(time) {
    let date = new Date(time);
    let ampm = date.getHours() >= 12 ? ' PM' : ' AM';
    let hr: any = date.getHours() % 12;
    hr = hr ? hr : 12;
    let month: any = date.getMonth() + 1;
    let min: any = date.getMinutes();
    let day: any = date.getDate();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    min = min < 10 ? '0' + min : min;
    hr = hr < 10 ? '0' + hr : hr;
    let dateTime = month + '/' + day + '/' + date.getFullYear() + '    ' + hr + ':' + min + ampm;
    return dateTime;
  }
  getDatewithTimezone() {
    let d = new Date();
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000 * (-4)));
    return nd;
  }
  childAddedEvent(data): Promise<any> {
    return new Promise((resolve, reject) => {
      let header = new Headers();
      header.set('Content-Type', 'application/json');
      this.http.post(environment.serverUrl + 'child-added', JSON.stringify(data), { headers: header }).subscribe((res) => {
        if (res.json().status) {
          resolve({ status: true });
        }
      }, (err) => {
        reject({ status: false });
        throw new Error(err);
      })
    })
  }
  getDefaultAppSettings(){
    return this.afDB.list("settings", ref=>ref.orderByKey().equalTo("app-settings")).valueChanges();
  }
}
