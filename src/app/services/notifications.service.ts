import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { NotificationComponent } from '../notification/notification.component';
import { notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private notifications: notification[] = [];
  private snackBarIsDisplayed: Boolean = false;
  private snackBarRef: MatSnackBarRef<NotificationComponent> | null = null;

  private defaultDelay: number = 5; //délai de disparition par défaut en seconde

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  /**
   * 
   * @param message Le message à afficher dans la notification
   * @param type Le type de notification: "Error" | "Warning" | "Success" | "Info"
   * @param duration Le délai avant que la notification ne disparaisse en seconde, si 0 -> valeur par défaut, si pas de valeur pas de disparition
   */
  public pushNotification = (message: string, type: "Error" | "Warning" | "Success" | "Info", duration?: number) => {
    const id = (Math.floor(Math.random() * (99999999999999999999 - 1)) + 1) + Date.now();
    let newNotification = {
      id,
      message,
      type
    }
    this.notifications.push(newNotification);
    if (!this.snackBarIsDisplayed) {
      let dataSnackBar = {};
      (duration) ? dataSnackBar = { notifications: this.notifications } : dataSnackBar = { duration: duration, notifications: this.notifications }

      this.snackBarRef = this.snackBar.openFromComponent(NotificationComponent, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackBar'],
        data: dataSnackBar,
      })
      this.snackBarIsDisplayed = true;
    }

    if (this.snackBarRef) {
      if (!duration && type != 'Error') {
        setTimeout(() => { if (this.snackBarRef) this.snackBarRef.instance.removeMessage(id) }, this.defaultDelay * 1000);
      } else if(duration) {
        setTimeout(() => { if (this.snackBarRef) this.snackBarRef.instance.removeMessage(id) }, duration * 1000);
      }

      this.snackBarRef.afterDismissed().subscribe(() => {
        this.snackBarIsDisplayed = false;
      })
    }
  }
}
