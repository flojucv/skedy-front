import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { map, Observable, of, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class  AuthGuard implements CanActivate {
  constructor(
    private AuthServ: AuthService,
    private router: Router,
    private cookie: CookieService,
  ) { }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const permission = route.data['permission'] as string;
    if (permission === 'login') {
      // Si l'utilisateur est déjà connecté, rediriger vers une autre page (par exemple, la page d'accueil)
      if (this.cookie.check('authToken')) {
        return of(true);
      } else {
        return of(this.router.parseUrl('/login'));
      }
    } else {
      return this.AuthServ.hasPermission(permission).pipe(
        map(() => true),
        catchError(() => of(this.router.parseUrl('/login')))
      );
    }
  }
}