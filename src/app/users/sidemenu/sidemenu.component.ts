import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {

  sidemenuText: string;
  userName:string;
  constructor(public authService: AuthService, public router: Router, public sharedService: SharedService) { }

  ngOnInit() {
    this.authService.checkLogin().subscribe(uid => {
      this.authService.getUserInformation(uid).then(res =>
      {
       this.userName=res[0]['firstname']+" "+res[0]['lastname']
      
    this.sharedService.sidemenuSelected.subscribe((res) => {
      this.sidemenuText = res;
    })
  })
    })
  }

  signout(){ 
    this.authService.doLogout().then((res) => {
      if(res){
     
        this.router.navigate(['/login']);
      }
    })
  }
}
