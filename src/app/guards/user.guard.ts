import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(public authService: AuthService, public router: Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> | boolean {
    return new Promise(resolve => {
      this.authService.checkUserRole().then(res => {
        if (res) {
          if (res == 'basic') {
            resolve(true);
          } else {
            this.router.navigate(['/accessdenied']);
            resolve(false);
          }
        } else {
          resolve(false);
        }
      })
    })
  }
}
