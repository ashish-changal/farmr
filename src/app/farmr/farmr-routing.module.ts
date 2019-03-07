import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FarmrComponent } from './farmr.component';
import { FarmrproduceComponent } from './farmrproduce/farmrproduce.component';
import { FarmrtransactionComponent } from './farmrtransaction/farmrtransaction.component';
import { FarmrdashboardComponent } from './farmrdashboard/farmrdashboard.component';
import { FarmdetailtransactionComponent } from './farmdetailtransaction/farmdetailtransaction.component';
import { AuthGuard } from './../guards/auth.guard';
import { FarminformationComponent } from './farminformation/farminformation.component';
import { CustomersComponent } from './customers/customers.component';
import { FarmrsettingsComponent } from './farmrsettings/farmrsettings.component';
import { FarmnotificationsComponent } from './farmnotifications/farmnotifications.component';
import { FarmraddproduceComponent } from './farmraddproduce/farmraddproduce.component';


const farmrRoutes: Routes = [
  {
    path: '',
    component: FarmrComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: FarmrdashboardComponent
      },
      {
        path: 'farminformation',
        component: FarminformationComponent
      },
      {
        path: 'produce',
        component: FarmrproduceComponent
      },
      {
        path: 'transaction/:orderby',
        component: FarmrtransactionComponent
      },
      {
        path: 'transaction/detailtransaction/:orderkey',
        component: FarmdetailtransactionComponent
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'settings',
        component: FarmrsettingsComponent
      },
      {
        path: 'notifications',
        component: FarmnotificationsComponent
      },
      {
        path: 'produce/addproduce/:produceKey',
        component:FarmraddproduceComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }]
  }
];


@NgModule({
  imports: [RouterModule.forChild(farmrRoutes)],
  exports: [RouterModule]
})
export class FarmrRoutingModule { }
