import {Injectable} from '@angular/core'
import { Http, Headers } from '@angular/http';
import { environment } from '../environments/environment';

@Injectable()
export class LoggerService {
    constructor(public http: Http){}

    log(error) {
        let header = new Headers();
        let data = {
            "error": error.toString(),
            "uid": environment.uid
        }
        header.set("Content-Type" , "application/json")
        this.http.post(environment.serverUrl+'logerror',JSON.stringify(data),{headers: header}).
        subscribe( res =>{
        }, err => {
        console.log(`Error is ${JSON.stringify(err)}`);
        });
    }
}