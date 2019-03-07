import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-farmersignup',
  templateUrl: './farmersignup.component.html',
  styleUrls: ['./farmersignup.component.css']
})
export class FarmersignupComponent {

  farmersignup = {
    firstname: '',
    lastname: '',
    streetaddress1: '',
    streetaddress2: '',
    city:'',
    state:'',
    phonenumber:'',
    zipcode: '',
    email: '',
    password: '',
    usertype: 'farmer'
  }
  states = [
    ('AL'), ('AK'), ('AZ'), ('AR'), ('CA'), ('CO'), ('CT'),('DE'), ('FL'), ('GA'),
    ('HI'), ('ID'), ('IL'),('IN'), ('IA'), ('KS'), ('KY'), ('LA'), ('ME'),('MD'), 
    ('MA'), ('MI'), ('MN'), ('MS'), ('MO'),('MT'), ('NE'), ('NV'), ('NH'), ('NJ'), 
    ('NM'), ('NY'),('NC'), ('ND'), ('OH'), ('OK'), ('OR'), ('PA'),('RI'), ('SC'), 
    ('SD'), ('TN'), ('TX'), ('UT'),('VT'), ('VA'), ('MI'), ('WA'), ('WV'), ('WI'),('WY')
   
  ];
  isInValid :boolean= false;
  response:string = "";
  responseClass:string = "";
  constructor(public authServices: AuthService, public router: Router,public sharedService: SharedService,
              public loggerService: LoggerService, public spinner: NgxSpinnerService) { }

  signUpfarmer(signupForm) {
    if(signupForm.valid)
    {
    this.spinner.show();
    this.authServices.farmerSignUp(this.farmersignup).then((res) => {
      this.spinner.hide();
      if(res.status){
        this.farmersignup = {
          firstname: '',
          lastname: '',
          streetaddress1: '',
          streetaddress2: '',
          city:'',
          state:'',
          phonenumber:'',
          zipcode: '',
          email: '',
          password: '',
          usertype: 'farmer'
        }
        this.responseClass = "response-success";
          this.response = "You have registered successfully please check your mail for verification";
          this.sharedService.childAddedEvent({action: 'user', key: res.uid});
          this.authServices.doLogout().then(()=>{
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
  else{
      this.isInValid= true;
    }
}
_keyPress(event: any) {
  var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
       return false;
    return true;
    
}

}
