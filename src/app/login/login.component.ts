import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user = {
    email: '',
    password: ''
  };
  isInValid: boolean = false;
  response: string = "";
  responseClass: string = "";
  constructor(public authService: AuthService, public router: Router,
    private spinner: NgxSpinnerService) { }

  login(login) {
    if (login.valid) {
      this.spinner.show();
      this.authService.doLogin(this.user).then((res) => {
        if (res.status) {
          // this.responseClass = "response-success";
          // this.response = "Login successfully";
          if (res.type == 'basic') {
            this.router.navigate(['/users']);
          }
          else if (res.type == 'admin') {
            this.router.navigate(['/admin']);
          } else if (res.type == 'farmer') {
            this.router.navigate(['/farmr']);
          }
         this.spinner.hide();
        } else {
          this.spinner.hide();
          this.responseClass = "response-failed";
          this.response = res.message;
          setTimeout(() => {
            this.response = "";
          }, 20000)
        }
      })
    } else {
      this.isInValid = true;
    }
  }
  logout() {
    this.authService.doLogout();
  }
  signUp() {

    this.router.navigateByUrl('login');
  }
  farmrSignup() {

    this.router.navigateByUrl('farmersignup');
  }
  openForgotPassword(){
    alert("clicked");
  }
}
