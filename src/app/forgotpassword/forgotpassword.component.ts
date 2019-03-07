import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  userEmail:string;
  response: string = "";
  responseClass: string = "";
  constructor(public authService: AuthService, public router: Router,
              private spinner: NgxSpinnerService) { }

  ngOnInit() {
  }

  forgotPassword(forgotPassword) {
    if (forgotPassword.valid) {
      this.spinner.show();
      this.authService.sendPasswordResetLink(this.userEmail).then((res) => {
        this.responseClass = "response-success";
        this.response = "Please check your registered email account for password rest link";
        this.spinner.hide();
        setTimeout(() => {
          this.response = ""
        }, 5000)
      }).catch((err) => {
        this.spinner.hide();
        this.responseClass = "response-failed";
        this.response = err.message;
        setTimeout(() => {
          this.response = ""
        }, 5000)
      })
    }
  }
}
