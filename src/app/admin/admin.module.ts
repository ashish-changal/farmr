import { AdmindashboardComponent } from './admindashboard/admindashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminsidemenuComponent } from './adminsidemenu/adminsidemenu.component';
import { AdminfarmComponent } from './adminfarm/adminfarm.component';
import { ServiceService }  from './service.service';
import { SharedModule } from '../shared.module';
import { AdmindetailtransactionComponent } from './admindetailtransaction/admindetailtransaction.component';
import { CustomersComponent } from './customers/customers.component';
import { ReportsComponent } from './reports/reports.component';
import { PendingfarmsComponent } from './pendingfarms/pendingfarms.component';
import { CustomerrewardsComponent } from './customerrewards/customerrewards.component';
import { AdminnotificationsComponent } from './adminnotifications/adminnotifications.component';
import { AddnewfarmComponent } from './addnewfarm/addnewfarm.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';


@NgModule({
    imports: [
      CommonModule,
      AdminRoutingModule,
      SharedModule
    ],
    declarations: [
      AdminComponent,
      AdmindashboardComponent,
      AdminsidemenuComponent, 
      AdminfarmComponent, 
      AdmindetailtransactionComponent, 
      CustomersComponent, 
      ReportsComponent, 
      PendingfarmsComponent, 
      CustomerrewardsComponent, 
      AdminnotificationsComponent,
      AddnewfarmComponent,
      AppSettingsComponent

    ],
    providers: [ServiceService]
  })
  export class AdminModule { }
  