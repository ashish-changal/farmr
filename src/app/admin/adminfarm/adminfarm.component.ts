import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { FileUpload } from '../fileupload';
import { SharedService } from '../../shared.service';
import { AdminComponent } from '../admin.component';
import { Router } from '@angular/router';

declare var jQuery: any;
@Component({
  selector: 'app-adminfarm',
  templateUrl: './adminfarm.component.html',
  styleUrls: ['./adminfarm.component.css']
})

export class AdminfarmComponent implements OnInit {
  selectedFiles: any = [];
  currentFileUpload: FileUpload
  farmKey: string;
  farmName: string;
  farmImage: any;
  p: number = 1;
  farms = [];
  itemsForSearch = [];
  _sub: any;
  toggle = {
    name: 2,
    status: 2,
    zipcode: 2,
  }
  noRecord: string = 'Fatching data...';
  constructor(public services: ServiceService, public sharedService: SharedService,
    public parent: AdminComponent, public router: Router) { }

  ngOnInit() {
    this._sub = this.services.getFarms().subscribe(res => {
      if (res.length > 0) {

        this.farms = [];
        for (let i = 0; i < res.length; i++) {
          if(res[i].status != 'pending'){
            let data = {};
            data['key'] = res[i].key;
            data['image'] = res[i].image;
            data['name'] = res[i].name;
            data['status'] = res[i].status;
            data['address1'] = res[i].farmaddress1 + " " + res[i].farmaddress2;
            data['address2'] = res[i].city + ', ' + res[i].state + ' ' + res[i].zipcode;
            data['zipcode'] = res[i].zipcode;
            this.farms.push(data);
          }
        }
        this.sortByColumn('status', 2);
        this.itemsForSearch = this.farms;
      } else {
        this.noRecord = 'No farm is associated';
      }
    })
    this.sharedService.currentSearch.subscribe(res => {
      let val: any = res;
      this.farms = this.itemsForSearch;

      if (val && val.trim() != '' && this.farms.length > 0) {
        this.farms = this.farms.filter((item) => {
          return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.address1.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.address2.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
            item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) == 0)
        })
        if (this.farms.length == 0) {
          this.noRecord = 'No record found';
        }
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.parent.pageTitle = "List of Farms";
      this.sharedService.setSearchBox(true);
      this.sharedService.setSearchBoxText("Search by Farm name/Address/Zipcode");
      this.sharedService.setProduceButtonValue(true);
      this.sharedService.selectSidemenu("allfarms");
    })
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }
  search(val: any) {
    this.farms = this.itemsForSearch;
    if (val && val.trim() != '') {
      this.farms = this.farms.filter((item) => {
        return (item.zipcode.toString().toLowerCase().indexOf(val.toLowerCase()) > -1 ||
          item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
      })
    }
  }



  deleteFarm(farmkey, name, image) {
    if (farmkey) {
      this.farmKey = farmkey;
      this.farmName = name;
      this.farmImage = image;
      jQuery("#deletefarm").modal("show");
    }
  }
  removefarm() {
    this.services.deleteFarm(this.farmKey);
  }

  editFarm(user, i) {
    this.router.navigate(['admin/farms/addnewfarm', user]);
  }
  sortByColumn(columnDef, toggle) {
    switch (columnDef) {
      case 'zipcode':
        if (toggle == 0) {
          this.itemsForSearch = this.farms.sort((a, b) => {
            return b['zipcode'] - a['zipcode'];
          })
        } else {
          this.itemsForSearch = this.farms.sort((a, b) => {
            return a['zipcode'] - b['zipcode'];
          })
        }
        this.toggle = {
          name: 2,
          status: 2,
          zipcode: toggle == 0 ? 1 : 0,
        }
        break;

        case 'name':
        this.itemsForSearch  = this.customSort('name', toggle);
        this.toggle = {
          name: toggle == 0 ? 1 : 0,
          status: 2,
          zipcode: 2,
        }
        break;

        case 'status':
        this.itemsForSearch  = this.customSort('status', toggle);
        this.toggle = {
          name: 2,
          status: toggle == 0 ? 1 : 0,
          zipcode: 2,
        }
        break;
    }
  }
  customSort(key, toggle) {
    if (toggle == 0) {
      return this.farms.sort((a, b) => {
        if (a[key] > b[key]) return -1;
        if (a[key] < b[key]) return 1;
        return 0;
      })
    } else {
      return this.farms.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      })
    }
  }
}
