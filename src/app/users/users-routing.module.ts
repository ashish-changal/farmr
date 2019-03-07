import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { FarmdetailComponent } from './farmdetail/farmdetail.component';
import { NearbyfarmsComponent } from './nearbyfarms/nearbyfarms.component';
import { ProduceComponent } from './produce/produce.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { UsersComponent } from './users.component';
import { AuthGuard } from '../guards/auth.guard';
import { SettingsComponent } from './settings/settings.component';
import { HistoryComponent } from './history/history.component';
import { ProfileComponent } from './profile/profile.component';
import { DetailhistoryComponent } from './detailhistory/detailhistory.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RewardsComponent } from './rewards/rewards.component';
import { ThankyouComponent } from './thankyou/thankyou.component';

const usersRoutes: Routes = [
  {
    path:'',
    component: UsersComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'nearbyfarms',
        component: NearbyfarmsComponent,
      },
      {
      
       path:'nearbyfarms/farmdetail/:farmkey',
        component: FarmdetailComponent
      },
      {
        path: 'nearbyfarms/produce/:farmkey',
        component: ProduceComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'history',
        component: HistoryComponent
      },
      {
        path: 'rewards',
        component: RewardsComponent
      },
      {
        path: "notifications",
        component: NotificationsComponent
      },
      {
        path: 'history/detailhistory/:ordernumber',
        component: DetailhistoryComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'checkout/:farmkey',
        component: CheckoutComponent
      },
      {
        path: 'thankyou',
        component: ThankyouComponent
      },
      
    {
      path: '',
      redirectTo: 'nearbyfarms',
      pathMatch: 'full',
    }]
  }
];


@NgModule({
  imports: [RouterModule.forChild(usersRoutes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
