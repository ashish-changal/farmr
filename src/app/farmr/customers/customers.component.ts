import { Component, OnInit } from '@angular/core';
import { FarmrService } from '../services/farmr.service';
import { AuthService } from '../../auth/auth.service';
import { FarmrComponent } from '../farmr.component';
import { SharedService } from '../../shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
declare var jQuery : any;
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers = [];
  hide:string= "hide";
  menuActive: any;
  p: any = 1;
  itemsForSearch = [];
  noDataFound: string = "";
  _sub: any;
  toggle = {
    name: 2,
    zipcode: 2,
    totalspent: 2
  }
  constructor(public farmrService: FarmrService, public authService: AuthService,
    public parent: FarmrComponent, public sharedService: SharedService,
  public spinner : NgxSpinnerService) { }

  ngOnInit() {
   // this.noDataFound = "Fetching data...";
   this.spinner.show();
    this.parent.pageTitle = "Customers";

    this.authService.checkLogin().take(1).subscribe((uid) => {
      if(uid){
        this.farmrService.getFarmKey(uid).then((farmkey) => {
         
          if (farmkey) {
            this._sub = this.farmrService.getAllOrders(farmkey).subscribe((ordersResponse) => {
             
             this.spinner.hide();
              this.customers = [];
              let promises = [];
              if (ordersResponse.length > 0) {
                this.sharedService.setSearchBox(true);
                this.sharedService.setSearchBoxText("Search by Name/Zipcode");
                for (let i = 0; i < ordersResponse.length; i++) {
                  let singleOrder = ordersResponse[i];
                  promises.push(this.authService.getUserInformation(singleOrder.uid))
                }
                Promise.all(promises).then(users => {
                  for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    let singleOrder = ordersResponse[i];
                    let position = this.containsObject(singleOrder, this.customers);
                    if (!position) {
                      let customer = {
                        uid: singleOrder.uid,
                        name: user[0].firstname + ' ' + user[0].lastname,
                        zipcode: user[0].zipcode,
                        amount: singleOrder.amount
                      }
                      this.customers.push(customer);
                    } else {
                      this.customers[position - 1].amount = this.customers[position - 1].amount + singleOrder.amount;
                    }
                  }
                  this.sortByColumn('name', 1);
                  // this.customers = this.uniqEs6(this.customers);
                  this.itemsForSearch = this.customers;
                })
              } else {
                this.noDataFound = "No Records Found.";
                this.sharedService.setSearchBox(false);
              }
            })
          } else {
            this.spinner.hide();
            this.noDataFound = "No Records Found.";
          }
          this.sharedService.currentSearch.subscribe(res => {
            let val: any = res;
            this.customers = this.itemsForSearch;
            // if the value is an empty string don't filter the items
            if (val && val.trim() != '') {
              this.customers = this.customers.filter((item) => {
                return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
                  item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) == 0)
              })
              if (this.customers.length == 0) {
                this.noDataFound = "No records found";
              }
            }
          })
        })
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.sharedService.selectSidemenu('customer');
      this.sharedService.setProduceButtonValue(false);
    })
  }
  ngOnDestroy() {
    if (this._sub != undefined && this._sub != null) {
      this._sub.unsubscribe();
    }
  }
  search(val: any) {
    this.customers = this.itemsForSearch;
    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.customers = this.customers.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) != -1 ||
          item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) == 0);
      })
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
          zipcode: 2
        }
        break;
      case 'name':
        this.itemsForSearch = this.customers = this.customSort('name', toggle);
        this.toggle = {
          totalspent: 2,
          name: toggle == 0 ? 1 : 0,
          zipcode: 2
        }
        break;
      case 'zipcode':
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
          totalspent: 2,
          name: 2,
          zipcode: toggle == 0 ? 1 : 0,
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
