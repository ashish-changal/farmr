import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'admin-adminsidemenu',
  templateUrl: './adminsidemenu.component.html',
  styleUrls: ['./adminsidemenu.component.css']
})
export class AdminsidemenuComponent implements OnInit {

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
      this.router.navigate(['/login']);
    })
  }
  
}