import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SharedService {

  private search = new BehaviorSubject<string>("");
  currentSearch = this.search.asObservable();
  constructor() { }
  changeMessage(searchKey: string) {
    this.search.next(searchKey)
  }
  
}
