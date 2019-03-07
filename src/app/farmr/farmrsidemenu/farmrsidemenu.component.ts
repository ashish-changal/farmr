import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'farmr-sidemenu',
  templateUrl: './farmrsidemenu.component.html',
  styleUrls: ['./farmrsidemenu.component.css']
})
export class FarmrsidemenuComponent implements OnInit {

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

  signout() {
    this.authService.doLogout().then((res) => {
      this.router.navigate(['/login']);
    })
  }

}
