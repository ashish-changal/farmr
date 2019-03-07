import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuard } from './../guards/auth.guard';

import { AdmindashboardComponent } from './admindashboard/admindashboard.component';
import { AdminfarmComponent } from './adminfarm/adminfarm.component';
import { AdmindetailtransactionComponent } from './admindetailtransaction/admindetailtransaction.component';
import { CustomersComponent } from './customers/customers.component';
import { PendingfarmsComponent } from './pendingfarms/pendingfarms.component';
import { ReportsComponent } from './reports/reports.component';
import { CustomerrewardsComponent } from './customerrewards/customerrewards.component';
import { AdminnotificationsComponent } from './adminnotifications/adminnotifications.component';
import { AddnewfarmComponent } from './addnewfarm/addnewfarm.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: AdmindashboardComponent
      },
      {
        path: 'farms',
        component: AdminfarmComponent

      },
      {
        path: 'pendingfarms',
        component: PendingfarmsComponent

      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'rewards',
        component: CustomerrewardsComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      {
        path: 'notifications',
        component: AdminnotificationsComponent
      },
      {
        path: 'app-settings',
        component: AppSettingsComponent
      },
      {
        path: 'dashboard/admindetailtransaction/:orderkey',
        component: AdmindetailtransactionComponent
      },
      {
        path:'farms/addnewfarm/:farmKey',
        component: AddnewfarmComponent
      },
      
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }]
  }
];


@NgModule({
  imports: [RouterModule.forChild(adminRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
