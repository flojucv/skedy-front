import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notifications = inject(NotificationsService);

  return next(req).pipe(
    catchError((res) => {
      // Affichage de l'erreur en console
      console.error('Erreur interceptée :', res);

      if( res.status != 403) {
        notifications.pushNotification(res.error.messages.fr, 'Error');
      }
      // Renvoyer l'erreur pour que le composant appelant puisse également la gérer
      return throwError(() => res);
    })
  );
};
