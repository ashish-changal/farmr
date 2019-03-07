import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { AdminComponent } from '../admin.component';
import { ServiceService } from '../service.service';
import { IMyDpOptions } from 'mydatepicker';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  farms = [];
  _sub = [];
  orderlist = [];
  reportData = {
    fromDate: '',
    toDate: '',
    farmKey: ''
  }
  p:any = 1;
  responseClass: string;
  response: string = "";
  toggleShow: boolean = false;
  serachRecords = [];
  totalSales: number = 0;
  users:any = {};
  toggle = {
    price: 2,
    status: 2,
    date: 2
  }
  public myDatePickerOptions: IMyDpOptions = {
    editableDateField: false,
    openSelectorOnInputClick: true,
    dateFormat: 'mm-dd-yyyy',
  };
  constructor(public sharedService: SharedService, public parent: AdminComponent,
    public services: ServiceService) {
    let currDate = this.sharedService.getDatewithTimezone();
    this.myDatePickerOptions.disableSince = { year: currDate.getFullYear(), month: currDate.getMonth() + 1, day: currDate.getDate()+1 }
  }

  ngOnInit() {
    let sub2 = this.services.getUsers().subscribe((users)=>{
      users.forEach(user=>{
        if(user.usertype == "basic"){
          this.users[user.key] = {
            uid: user.key,
            userName: user.firstname+' '+user.lastname
          }
        }
      })
      this._sub.push(sub2);
      this.getSalesResult();
    })
    let sub = this.services.getFarms().subscribe((farms) => {
      if (farms.length > 0) {
        this.farms = [];
        for (let i = 0; i < farms.length; i++) {
          if (farms[i]['status'].toLowerCase() == 'approved') {
            this.farms.push({
              farmkey: farms[i].key,
              farmname: farms[i].name
            })
          }
        }
      }
    })
    this._sub.push(sub);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.parent.pageTitle = "Reports"
      this.sharedService.setSearchBox(false);
      this.sharedService.setProduceButtonValue(false);
      this.sharedService.selectSidemenu("reports");
    })
  }

  ngOnDestroy() {
    for (let i = 0; i < this._sub.length; i++) {
      this._sub[i].unsubscribe();
    }
  }
  getSalesResult() {
    let sub = this.services.orderlist().subscribe(res => {
      this.orderlist = [];
      for (let i = 0; i < res.length; i++) {
        let data = {};
        let orderDate = this.sharedService.getFormattedDateTime(res[i].orderdate);
        data['orderNumber'] = res[i].ordernumber.toUpperCase();
        data['amount'] = res[i].amount / 100;
        data['status'] = res[i].ordersstatus;
        data['date'] = res[i].orderdate;
        data['farmkey'] = res[i].farmkey;
        data['orderdate'] = orderDate;
        let remarks = '';
        if (res[i]['totalrefunds'] != null && res[i]['totalrefunds'] != undefined) {
          Object.keys(res[i]['totalrefunds']).map((key, index) => {
            if (index > 0) {
              remarks = remarks + ', ' + res[i]['totalrefunds'][key].remarks;
            } else {
              remarks = res[i]['totalrefunds'][key].remarks;
            }
          })
        } else {
          remarks = res[i].remarks ? res[i].remarks : "";
        }
        data['remarks'] = remarks;
        if(this.users[res[i].uid]) data['userName'] = this.users[res[i].uid].userName;
        this.orderlist.push(data);
      }
    })
    this._sub.push(sub);
  }

  getData() {
    this.p = 1;
    this.toggleShow = false;
    this.serachRecords = [];
    this.totalSales = 0;
    let from = new Date(this.reportData.fromDate['jsdate']).getTime();
    let endDate = new Date(this.reportData.toDate['jsdate']);
    let currentdate = new Date(this.reportData.toDate['jsdate']);
    currentdate.setDate(endDate.getDate()+1);
    let to = currentdate.getTime()
    if (from > to) {
      this.responseClass = 'response-failed';
      this.response = "Please Select proper date";
      setTimeout(() => {
        this.response = "";
      }, 3000)
    } else {
      for (let i = 0; i < this.orderlist.length; i++) {
        if (this.orderlist[i].date >= from && this.orderlist[i].date <= to && this.orderlist[i].farmkey == this.reportData.farmKey) {
          this.totalSales = this.totalSales + this.orderlist[i].amount;
          this.serachRecords.push(this.orderlist[i])
        }
      }
      this.sortByColumn('date', 0);
      if (this.serachRecords.length == 0) {
        this.toggleShow = true;
      }
    }
  }

  exportToExcel(){
    let selectedFarm = this.farms.filter((farm)=>{
      return farm.farmkey.indexOf(this.reportData.farmKey) == 0
    })
    this.services.generateExcelFile({farmName: selectedFarm[0].farmname,items:this.serachRecords});
  }
  sortByColumn(columnDef, toggle) {
    switch (columnDef) {
      case 'price':
        if (toggle == 0) {
          this.serachRecords = this.serachRecords.sort((a, b) => {
            return b['amount'] - a['amount'];
          })
        } else {
          this.serachRecords = this.serachRecords.sort((a, b) => {
            return a['amount'] - b['amount'];
          })
        }
        this.toggle = {
          price: toggle == 0 ? 1 : 0,
          status: 2,
          date: 2
        }
        break;
      case 'status':
        this.serachRecords = this.serachRecords = this.customSort('status', toggle);
        this.toggle = {
          price: 2,
          status: toggle == 0 ? 1 : 0,
          date: 2
        }
        break;
      case 'date':
        this.serachRecords = this.serachRecords = this.customSort('date', toggle);
        this.toggle = {
          price: 2,
          status: 2,
          date: toggle == 0 ? 1 : 0
        }
        break;
    }
  }
  customSort(key, toggle) {
    if (toggle == 0) {
      return this.serachRecords.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      })
    } else {
      return this.serachRecords.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      })
    }
  }
}
