import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { FormsModule } from '@angular/forms';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';
import { UserroleGuard } from './guards/userrole.guard';
import { CustomersignupComponent } from './customersignup/customersignup.component';
import { FarmersignupComponent } from './farmersignup/farmersignup.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxStripeModule } from 'ngx-stripe';
import { HttpModule } from '@angular/http';
import { MyDatePickerModule } from 'mydatepicker';
import { SharedService } from './shared.service';
import { MyErrorHandler } from "./myerrorhandler";
import { LoggerService } from './logger.service';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { UserGuard } from './guards/user.guard';
import { FarmrGuard } from './guards/farmr.guard';
import { AdminGuard } from './guards/admin.guard';
import { AccessdeniedComponent } from './accessdenied/accessdenied.component';
import { ThankyoupageComponent } from './thankyoupage/thankyoupage.component';
import { SharedModule } from './shared.module';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CustomersignupComponent,
    FarmersignupComponent,
    ThankyoupageComponent,
    LoginComponent,
    PagenotfoundComponent,
    AccessdeniedComponent,
    ForgotpasswordComponent,
    
  ],
  imports: [
    NgxSpinnerModule,
    BrowserModule,
    NgxStripeModule.forRoot(environment.stripeKey),
    AppRoutingModule,
    HttpModule,
    SharedModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpClientModule,
    MyDatePickerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AuthService,
    SharedService,
    AuthGuard,
    UserroleGuard,
    UserGuard,
    FarmrGuard,
    AdminGuard,
    LoggerService,
    { provide: ErrorHandler, useClass: MyErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
