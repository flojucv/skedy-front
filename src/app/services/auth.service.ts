import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private cookieService: CookieService,
    private apiService: ApiService
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  private checkAuthentication(): boolean {
    return !!this.cookieService.get('authToken');
  }

  login(username: string, password: string): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      console.log('Authenticating user:', username);
      this.apiService.login(username, password).subscribe({
        next: (response:any) => {
          if(!response.error) {
            this.cookieService.set('authToken', response.data.token);
            observer.next(true);
            observer.complete();
            this.isAuthenticatedSubject.next(true);

          } else {
            observer.error(response.messages);
            observer.complete();
          }
        },
        error: (error:any) => {
          observer.error(error);
          observer.complete();
        },
      });
    });
  }

  logout(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.cookieService.delete('authToken'),
      this.isAuthenticatedSubject.next(false);
      observer.next(true);
      observer.complete();
    })
  }

  public hasPermission = (prmPermission: string): Observable<Boolean> => {
    return new Observable<Boolean>((observer: Observer<Boolean>) => {
      // Vérifier d'abord si l'utilisateur est connecté
      if (!this.cookieService.check('authToken')) {
        observer.next(false);
        observer.complete();
        return;
      }
      
      this.apiService.hasPermission(prmPermission).subscribe({
        next: (response: any) => {
          if(response.error || response.data.hasPermission === false) {
            observer.next(false);
            observer.complete();
          } else {
            observer.next(true);
            observer.complete();
          }
        },
        error: (error: any) => {
          observer.next(false);
          observer.complete();
        },
      })
    });
  };
}