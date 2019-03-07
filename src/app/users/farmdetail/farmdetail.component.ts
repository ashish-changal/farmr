import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../services/user.service';
import { FarmsService } from '../services/farms.service';
import { AuthService } from '../../auth/auth.service';
import { UsersComponent } from '../users.component';
import { FarmDetails } from '../../models/farmdetails.model';
import { SharedService } from '../../shared.service';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-farmdetail',
  templateUrl: './farmdetail.component.html',
  styleUrls: ['./farmdetail.component.css']


})
export class FarmdetailComponent implements OnInit {
  
 
  public repoUrl:string;
  item: FarmDetails = <FarmDetails>{};
  uid: any;
  _sub: any;
  farmkey: any;
  hoursToggle: false;
  mySlice: number = 15;
  constructor(public activatedRoute: ActivatedRoute, public farmsservice: FarmsService,
    public authService: AuthService, public userService: UserService, public sharedService: SharedService,
    public zone: NgZone, public parent: UsersComponent, public router: Router, public meta: Meta) {
    this.authService.checkLogin().subscribe(res => {
      this.uid = res;
    })
  }


  openMore() {
    this.mySlice = this.mySlice + 15 > this.item.stocks.length ? this.item.stocks.length - 1 : this.mySlice + 15;
  }
  showLess() {
    this.mySlice = this.mySlice - 15 > this.item.stocks.length ? this.item.stocks.length - 1 : this.mySlice - 15;
  }
  ngOnInit() {
    let farmkey = this.activatedRoute.snapshot.paramMap.get('farmkey');
    this.repoUrl="www.studio45creations@gmail.com";
    let week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let order = { sunday: 1, monday: 2, tuesday: 3, wednesday: 4, thursday: 5, friday: 6, saturday: 7 };
    this.zone.run(() => {
      this._sub = this.farmsservice.getSingleFarm(farmkey).subscribe(farm => {
        let res = farm[0];

        this.parent.pageTitle = res['name'];
        this.item['key'] = farmkey;
        this.item['name'] = res['name'];

        this.item['image'] = res['image'];
        this.item['phonenumber'] = '(' + res['phonenumber'].substr(0, 3) + ') ' + res['phonenumber'].substr(3, 3) + '-' + res['phonenumber'].substr(6, 4);
        this.item['website'] = res['website'];
        this.item['farmdescription'] = res['farmdesc'] ? res['farmdesc'] : '';
        this.item['address1'] = res['farmaddress1'] + " " + res['farmaddress2'];
        this.item['address2'] = res['city'] + ', ' + res['state'] + ' ' + res['zipcode'];

        this.meta.updateTag({content:this.item['name']}, 'name="farm-title"');
        this.meta.updateTag({content:this.item['image']}, 'name="farm-image"');
        this.meta.updateTag({content:this.item['farmdescription']}, 'name="farm-desc"');

        if (res['distance'] != undefined && res['distance'] != null) {
          let distance = res['distance'];
          Object.keys(distance).map((key) => {
            if (distance[key][this.uid] != null && distance[key][this.uid] != undefined) {
              this.item['miles'] = distance[key][this.uid].toFixed(2);;
            }
          })
        } else {
          this.item['miles'] = 0;
        }
        let schedulehours = res['schedulehours'];

        let produceStocks = res['stock'];
        let stocks = [];
        if (produceStocks != undefined && produceStocks != null) {
          Object.keys(produceStocks).map((key, index) => {
            if (produceStocks[key].totalquantity > 0) {
              stocks.push(produceStocks[key].productname);
            }
          })
        }

        this.item['stocks'] = stocks;

        let date = this.sharedService.getDatewithTimezone();
        let hours = [];
        if (schedulehours != null && schedulehours != undefined) {
          Object.keys(schedulehours).map((day, index) => {
            let time = schedulehours[day].split('-');
            if (time.length > 1) {
              let startTime = time[0].split(':');
              let endTime = time[1].split(':');
              let ampm = +startTime[0] >= 12 ? 'PM' : 'AM';
              let hr = +startTime[0] % 12;
              hr = hr ? hr : 12;
              let formattedStartTime = hr + ':' + startTime[1] + ' ' + ampm;
              ampm = +endTime[0] >= 12 ? 'PM' : 'AM';
              hr = +endTime[0] % 12;
              hr = hr ? hr : 12;
              let formatedEndTime = hr + ':' + endTime[1] + ' ' + ampm;
              if (week[date.getDay()].toLowerCase() === day) {
                if ((date.getHours() == +startTime[0] && date.getMinutes() >= +startTime[1]) || (date.getHours() > +startTime[0] && date.getHours() < +endTime[0]) || (date.getHours() == +endTime[0] && date.getMinutes() <= +endTime[1])) {
                  hours.push({
                    day: day,
                    hours: formattedStartTime + '-' + formatedEndTime + ', Open Now'
                  })
                } else {
                  hours.push({
                    day: day,
                    hours: formattedStartTime + '-' + formatedEndTime + ', Closed Now'
                  })
                }
              } else {
                hours.push({
                  day: day,
                  hours: formattedStartTime + '-' + formatedEndTime
                })
              }
            } else {
              hours.push({
                day: day,
                hours: schedulehours[day]
              })
            }
          })
          hours.sort((a, b) => {
            return order[a.day] - order[b.day];
          })
          this.item['hours'] = hours;
        }
        this.item['fav'] = null;
        let likeObj = res['likedby'];
        if (likeObj != null && likeObj != undefined) {
          Object.keys(likeObj).map((key, index) => {
            if (likeObj[key].uid === this.uid) {
              this.item['fav'] = key;
            }
          })
        } else {
          this.item['fav'] = null;
        }
      });
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.setSearchBox(false);
      this.sharedService.selectSidemenu('nearbyfarms');
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined) {
      this._sub.unsubscribe();
    }
  }
  openWebsite() {
    let url = this.item.website;
    if(url != null && url != undefined){
      if (!url.match(/^https?:\/\//i)) {
        url = 'http://' + url;
      }
      window.open(url, "_blank");
    }
  }

  changeFav(farmkey: string, choicekey: string) {
    if (choicekey) {
      this.farmsservice.removeFromFavourite(farmkey, choicekey);
    } else {

      this.farmsservice.addToFavourite(farmkey, this.uid);
    }
  }


  goToProduce(farmkey) {
    this.router.navigate(['users/nearbyfarms/produce', farmkey]);
  };


}
