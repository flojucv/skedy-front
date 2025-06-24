import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error403',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './error403.component.html',
  styleUrl: './error403.component.less'
})
export class Error403Component {
  goToLogin() {
    window.location.href = '/login';
  }

  goBack() {
    window.history.back();
  }
}
