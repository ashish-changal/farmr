import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { NearbyfarmsComponent } from './nearbyfarms/nearbyfarms.component';
import { ProduceComponent } from './produce/produce.component';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { FarmdetailComponent } from './farmdetail/farmdetail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { UsersComponent } from './users.component';
import { FarmsService } from './services/farms.service';
import { FormsModule } from '@angular/forms';
import { UserService } from './services/user.service';
import { SharedModule } from '../shared.module';
import { YearPicker } from '../components/year-picker';
import { MonthPicker } from '../components/month-picker';
import { SettingsComponent } from './settings/settings.component';
import { HistoryComponent } from './history/history.component';
import { ProfileComponent } from './profile/profile.component';
import { DetailhistoryComponent } from './detailhistory/detailhistory.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RewardsComponent } from './rewards/rewards.component';
import { ThankyouComponent } from './thankyou/thankyou.component';
import { ShareButtonModule } from '@ngx-share/button';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    HttpClientModule,
    ShareButtonModule.forRoot()
  ],
  declarations: [
    NearbyfarmsComponent,
    ProduceComponent,
    SidemenuComponent,
    FarmdetailComponent,
    CheckoutComponent,
    UsersComponent,
    YearPicker,
    MonthPicker,
    SettingsComponent,
    HistoryComponent,
    ProfileComponent,
    DetailhistoryComponent,
    NotificationsComponent,
    RewardsComponent,
    ThankyouComponent
  ],
  providers: [FarmsService, UserService]
})
export class UsersModule { }
