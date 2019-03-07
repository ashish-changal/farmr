import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin.component';
import { SharedService } from '../../shared.service';
import { ServiceService } from '../service.service';
import { AuthService } from '../../auth/auth.service';
declare var jQuery: any;
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers = [];

  itemsForSearch = [];
  noDataFound: string = 'Fetching data...';
  _sub: any;
  p: any = 1;
  toggle = {
    name: 2,
    zipcode: 2,
    totalspent: 2,
    rewards: 2
  }
  constructor(public parent: AdminComponent, public sharedService: SharedService,
    public adminService: ServiceService, public authService: AuthService) { }

  ngOnInit() {

    this.parent.pageTitle = "List of Consumers";
    this._sub = this.adminService.getUsers().subscribe((users) => {
      if (users.length > 0) {
        this.customers = [];
        users.forEach((user) => {
         
          if (user.usertype == 'basic') {
            this.adminService.getOrdersOfUser(user.key).then((orders) => {
              let customer = {};
              if (orders.length > 0) {
                let totalAmount = 0;
                orders.forEach((order) => {
                  totalAmount = totalAmount + order.amount;
                })
                customer = {
                  uid: user.uid,
                  name: user.firstname + ' ' + user.lastname,
                  zipcode: user.zipcode,
                  amount: totalAmount,
                  rewards: user.points ? user.points : 0
                }
              } else {
                customer = {
                  uid: user.uid,
                  name: user.firstname + ' ' + user.lastname,
                  zipcode: user.zipcode,
                  amount: 0,
                  rewards: user.points ? user.points : 0
                }
              }
              this.customers.push(customer);
              this.sortByColumn('name', 1);
            })
          }
        })
        setTimeout(() => {
          if(this.customers.length == 0){
            this.noDataFound = "No Customer Found.";
          }
        }, 3000)
      } else {
        this.noDataFound = "No Customer Found.";
      }
    })

    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.customers = this.itemsForSearch;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != '' && this.customers.length > 0) {
        this.customers = this.customers.filter((item) => {
          return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) == 0)
        })
        if (this.customers.length == 0) {
          this.noDataFound = "No record found";
        }
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Name/Zipcode");
      this.sharedService.setProduceButtonValue(false);
      this.sharedService.selectSidemenu("customers");
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined && this._sub != null) {
      this._sub.unsubscribe();
    }
  }
  containsObject(obj, list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].uid === obj.uid) {
        return i + 1;
      }
    }
    return false;
  }
  sortByColumn(columnDef, toggle) {
    switch (columnDef) {
      case 'totalspent':
        if (toggle == 0) {
          this.itemsForSearch = this.customers.sort((a, b) => {
            return b['amount'] - a['amount'];
          })
        } else {
          this.itemsForSearch = this.customers.sort((a, b) => {
            return a['amount'] - b['amount'];
          })
        }
        this.toggle = {
          totalspent: toggle == 0 ? 1 : 0,
          name: 2,
          zipcode: 2,
          rewards: 2
        }
        break;
      case 'name':
        this.itemsForSearch = this.customers = this.customSort('name', toggle);
        this.toggle = {
          totalspent: 2,
          name: toggle == 0 ? 1 : 0,
          zipcode: 2,
          rewards: 2
        }
        break;
      case 'zipcode':
        if (toggle == 0) {
          this.itemsForSearch = this.customers.sort((a, b) => {
            return b['zipcode'] - a['zipcode'];
          })
        } else {
          this.itemsForSearch = this.customers.sort((a, b) => {
            return a['zipcode'] - b['zipcode'];
          })
        }
        this.toggle = {
          totalspent: 2,
          name: 2,
          zipcode: toggle == 0 ? 1 : 0,
          rewards: 2
        }
        break;
      case 'rewards':
        if (toggle == 0) {
          this.itemsForSearch = this.customers.sort((a, b) => {
            return b['rewards'] - a['rewards'];
          })
        } else {
          this.itemsForSearch = this.customers.sort((a, b) => {
            return a['rewards'] - b['rewards'];
          })
        }
        this.toggle = {
          totalspent: 2,
          name: 2,
          zipcode: 2,
          rewards: toggle == 0 ? 1 : 0
        }
        break;
    }
  }
  customSort(key, toggle) {
    if (toggle == 0) {
      return this.customers.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      })
    } else {
      return this.customers.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      })
    }
  }


}
