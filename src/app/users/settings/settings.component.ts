import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { SharedService } from '../../shared.service';
import { UsersComponent } from '../users.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  oldEmail = "";
  user = {
    email: "",
    password: "",
    oldpassword: ""
  }
  response:string = "";
  responseClass:string = "";
  isAuthenticate:boolean = false;
  constructor(public authService: AuthService, public parent: UsersComponent,
              public sharedService: SharedService, public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.authService.getUserAuthData().take(1).subscribe((res) => {
      this.user.email = res.email;
      this.oldEmail = res.email;
    })
  }
  ngAfterViewInit() {
    this.parent.pageTitle = "Settings";
    
    setTimeout(() => {
      this.sharedService.selectSidemenu('settings');
      this.sharedService.setSearchBox(false);
    })
  }
  authenticate(){
    this.spinner.show();
    this.authService.reAuthenticate(this.user).then((res) => {
      this.spinner.hide();
      if(res.status){
        this.isAuthenticate = true;
      } else {
        this.responseClass = 'response-failed';
        this.response = res.message;
        setTimeout(() => {
          this.response = "";
        },20000)
      }
    })
  }
  updateUserAuth(updateUserAuth:NgForm){
    this.spinner.show();
    if(this.oldEmail == this.user.email){
      this.authService.updateUserPassword(this.user.password).then((response) => {
        this.spinner.hide();
        if(response.status){
          updateUserAuth.resetForm();
          this.isAuthenticate = false;
          this.user.oldpassword="";
          this.responseClass = "response-success";
          this.response = "Updated Sucessfully";
        }else{
          this.responseClass = "response-failed";
          this.response = response.message;
        }
        setTimeout(() => {
          this.response = "";
        },20000)
      })
    }
  }
  cancel(settingForm:NgForm){
    settingForm.reset();
    this.isAuthenticate = false;
  }
}
