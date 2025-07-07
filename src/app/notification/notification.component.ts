import { Component, Inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { notification } from '../models/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.less'
})
export class NotificationComponent {

  public notifications:notification[] = [];

  constructor(
    public snackBarRef: MatSnackBarRef<NotificationComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {
    this.notifications = this.data.notifications;
  }

  removeMessage(id:number) {
    this.notifications.forEach((notification:notification, index: number) => {
      if(notification.id == id) {
        this.notifications.splice(index, 1);
      }
    })
    if(this.notifications.length === 0) {
      this.snackBarRef.dismiss();
    }
  }
}
