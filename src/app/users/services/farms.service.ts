import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
@Injectable()
export class FarmsService {

  constructor(public afDB: AngularFireDatabase) { 
  }

  getFarms(){
    return this.afDB.list('/farms').stateChanges(['child_added', 'child_changed', 'child_removed']);
  }

  getAllFarms(){
    return this.afDB.list('/farms').valueChanges();
  }

  addToFavourite(farmkey, uid): Promise<any>{
    return new Promise(resolve => {
      this.afDB.list('/farms/'+farmkey+'/likedby').push({uid: uid}).then( res => resolve(true), 
      err => resolve(false));
    })
  }

  removeFromFavourite(farmkey, choicekey): Promise<any>{
    return new Promise(resolve => {
      this.afDB.list('/farms/'+farmkey+'/likedby').remove(choicekey).then( res => resolve(true), 
      err => resolve(false));
    })
  }

  getSingleFarm(key){
    return this.afDB.list('/farms', ref => ref.orderByKey().equalTo(key)).valueChanges();
  }
 
}
