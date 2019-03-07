import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersComponent } from '../users.component';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.css']
})
export class ThankyouComponent implements OnInit {

  constructor(public router: Router, public parent: UsersComponent, public sharedService: SharedService) { }

  ngOnInit() {
   
    this.parent.pageTitle = "Thank you page";
    setTimeout(() => {
      this.sharedService.setSearchBox(false);
      this.router.navigate(['users/nearbyfarms']);
    }, 70000)
  }

}
