import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserroleGuard implements CanActivate {
  constructor(public authService: AuthService, public router: Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> | boolean {
    return this.authService.checkUserRole().then(res => {
      if (res) {
        if(res == 'basic'){
          this.router.navigate(['/users']);
        }else if(res == 'admin'){
          this.router.navigate(['/admin']);
        }
         else if(res == 'farmer'){
          this.router.navigate(['/farmr']);
        }else{
          return true;
        }
      } else {
        return true;
      }
    })
  }
}
