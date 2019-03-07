import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(public authService: AuthService, public router: Router){}
  canActivate():Observable<boolean> | boolean {
    return this.authService.checkLogin().map( uid=> {
      if(uid){
        return true;
      }else{
        this.router.navigate(['/login']);
        return false;
      };
    })
  }
  canActivateChild():Observable<boolean> | boolean{
    return this.authService.checkLogin().map( uid=> {
      if(uid){
        return true;
      }else{
        this.router.navigate(['/login']);
        return false;
      };
    })
  }
}
