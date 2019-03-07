import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {CustomersignupComponent} from './customersignup/customersignup.component';
import { AuthGuard } from './guards/auth.guard';
import { UserroleGuard } from './guards/userrole.guard';
import {FarmersignupComponent} from './farmersignup/farmersignup.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { FarmrGuard } from './guards/farmr.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { AccessdeniedComponent } from './accessdenied/accessdenied.component';
import { ThankyoupageComponent } from './thankyoupage/thankyoupage.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [UserroleGuard]
  },
  {
    path: 'users',
    canActivate: [AuthGuard, UserGuard],
    loadChildren: 'app/users/users.module#UsersModule', 
  },
  {
    path: 'farmr',
    canActivate: [AuthGuard, FarmrGuard],
    loadChildren: 'app/farmr/farmr.module#FarmrModule',

  },
  {
    path: 'customersignup',
    component: CustomersignupComponent,
   },
   {
    path: 'forgotpassword',
    component: ForgotpasswordComponent,
   },
   {
    path: 'farmersignup',
    component: FarmersignupComponent,
   },
   {
    path: 'accessdenied',
    component: AccessdeniedComponent
   },
   {
    path: 'thankyoupage',
    component: ThankyoupageComponent
   },
   {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: 'app/admin/admin.module#AdminModule', 
  },
  {
    path: '**',
    component: PagenotfoundComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
