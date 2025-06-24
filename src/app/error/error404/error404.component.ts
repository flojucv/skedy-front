import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.less'
})
export class Error404Component {
  goHome() {
    window.location.href = '/';
  }

  goBack() {
    window.history.back();
  }

}
