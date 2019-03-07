import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmrRoutingModule } from './farmr-routing.module';
import { FarmrsidemenuComponent } from './farmrsidemenu/farmrsidemenu.component';
import { FarmrproduceComponent } from './farmrproduce/farmrproduce.component';
import { FarmrComponent } from './farmr.component';
import { FarmrtransactionComponent } from './farmrtransaction/farmrtransaction.component';
import { FarmrdashboardComponent } from './farmrdashboard/farmrdashboard.component';
import { FarmdetailtransactionComponent } from './farmdetailtransaction/farmdetailtransaction.component';
import { FarmrService } from './services/farmr.service';
import { SharedModule } from './../shared.module';
import { FarminformationComponent } from './farminformation/farminformation.component';

import { CustomersComponent } from './customers/customers.component';
import { FarmrsettingsComponent } from './farmrsettings/farmrsettings.component';
import { FarmnotificationsComponent } from './farmnotifications/farmnotifications.component';
import { FarmraddproduceComponent } from './farmraddproduce/farmraddproduce.component';

@NgModule({
  imports: [
    CommonModule,
    FarmrRoutingModule,
    SharedModule
  ],
  declarations: [FarmrComponent, FarmrsidemenuComponent, FarmrproduceComponent, FarmrtransactionComponent, FarmrdashboardComponent, FarmdetailtransactionComponent, FarminformationComponent, CustomersComponent, FarmrsettingsComponent, FarmnotificationsComponent, FarmraddproduceComponent],
  providers: [FarmrService]
})
export class FarmrModule { }
