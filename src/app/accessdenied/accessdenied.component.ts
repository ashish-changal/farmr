import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-accessdenied',
  templateUrl: './accessdenied.component.html',
  styleUrls: ['./accessdenied.component.css']
})
export class AccessdeniedComponent implements OnInit {

  constructor( private location:Location) { }
  backtopage()
  {
    this.location.back();
  }
  ngOnInit() {
  }

}
