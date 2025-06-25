import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.less'
})
export class HeaderComponent {

  isAdminValue: boolean = false;

  isAdmin(): boolean {
    return this.isAdminValue;
  }

  constructor(private AuthService: AuthService) {}

  ngOnInit(): void {
    this.AuthService.hasPermission("admin").subscribe({
      next: (hasPermission: any) => {
        this.isAdminValue = hasPermission;
      },
      error: () => {
        this.isAdminValue = false;
      }
    });
  }
}
