import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { db } from 'baqend';

db.connect('streaming', true);

@Injectable()
export class DBReady  {
  resolve(_route: ActivatedRouteSnapshot): Promise<any> {
    return db.ready();
  }
}

@Injectable()
export class DBLoggedIn  {
  constructor(private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    return db.ready().then(() => {
      if (!db.User.me) {
        this.router.navigate(['/signup']);
        return false;
      }
      return true;
    });
  }
}

export const DB_PROVIDERS = [DBReady, DBLoggedIn];
