import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-customersignup',
  templateUrl: './customersignup.component.html',
  styleUrls: ['./customersignup.component.css']
})
export class CustomersignupComponent {

  custsignup = {
    firstname: '',
    lastname: '',
    zipcode: '',
    email: '',
    streetaddress1:'',
    streetaddress2: '',
    city: '',
    state: '',
    phonenumber: '',
    password: '',
    usertype: 'basic',
  }
  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'),('DE'), ('FL'), ('GA'),
    ('HI'), ('ID'), ('IL'),('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'),('MD'), 
    ('MA'), ('MI'), ('MN'), ('MS'), ('MO'),('MT'), ('NE'), ('NV'), ('NH'), ('NJ'), 
    ('NM'), ('NY'),('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'),('RI'), ('SC'), 
    ('SD'), ('TN'), ('TX'), ('UT'),('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'),('WY')
   
  ];
  response: string = "";
  isInValid: boolean = false;
  responseClass: string = "";
  constructor(public authServices: AuthService, public router: Router, public sharedService: SharedService,
    public loggerService: LoggerService, public spinner: NgxSpinnerService) { }

  signUp(signupForm) {
    
      this.spinner.show();
      this.authServices.basicSignUp(this.custsignup).then((res) => {
        if (res.status) {
            this.spinner.hide();
            this.custsignup = {
              firstname: '',
              lastname: '',
              zipcode: '',
              email: '',
              phonenumber: '',
              password: '',
              streetaddress1: '',
              streetaddress2: '',
              city: '',
              state: '',
              usertype: 'basic',
            }
            this.responseClass = "response-success";
            this.response = "You have registered successfully please check your mail for verification";
            this.sharedService.childAddedEvent({action: 'user', key: res.uid});
            this.authServices.doLogout().then(() => {
              this.router.navigate(['/thankyoupage']);
            })
        }
      }).catch((err) => {
        this.spinner.hide();
        this.responseClass = "response-failed";
        this.response = err.message;
        setTimeout(() => {
          this.response = "";
        }, 20000)
        this.loggerService.log(err.message);
      })
    
  }

  _keyPress(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
       return false;
    return true;
  }

}


