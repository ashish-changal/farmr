import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin.component';
import { SharedService } from '../../shared.service';
import { ServiceService } from '../service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.css']
})
export class AppSettingsComponent implements OnInit {

  appSettings:any = {};
  settingPassword:any;
  _sub:any;
  responseClass: string;
  response: string = "";
  isAuthenticate:boolean = false;
  constructor(public parent: AdminComponent, public sharedService: SharedService,
    public services: ServiceService, public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.parent.pageTitle = "App Settings";
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
      this.sharedService.selectSidemenu("app-settings");
    })
  }

  updateAppSettings(){
    this.services.updateAppSettings(this.appSettings).then(()=>{
      this.responseClass = 'response-success';
      this.response = "Updated Successfully";
    }).catch(()=>{
      this.responseClass = 'response-failed';
      this.response = "Unable to update the details";
    })
  }

  cancel(settingForm: NgForm){
    this.response = '';
    settingForm.resetForm();
    this.isAuthenticate = false;
    this.settingPassword = '';
  }
  
  authenticate(){
    this.response = '';
    this.spinner.show();
    this.services.authenticateSetting(this.settingPassword).then((response)=>{
      if(response){
        this.services.getAppSettings().take(1).subscribe((settings)=>{
          this.spinner.hide();
          this.isAuthenticate = true;
          if(settings && settings.length > 0){
            this.appSettings = settings[0];
          }
        })
      }else{
        this.spinner.hide();
        this.isAuthenticate = false;
        this.responseClass = 'response-failed';
        this.response = "Incorrect Password";
      }
    })
  }

  ngOnDestroy(){
    if(this._sub != undefined){
      this._sub.unsubscribe();
    }
  }
}
