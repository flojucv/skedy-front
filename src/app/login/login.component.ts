import { AuthService } from './../services/auth.service';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less'
})
export class LoginComponent {

  public loginForm: any;
  public showPassword: boolean = false;
  public error: any = {
    status: false,
    messages: {
      fr: 'Identifiants incorrects. Veuillez réessayer.',
      en: 'Invalid credentials. Please try again.',
    },
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  onSubmit(): void {
    console.log(this.loginForm.valid);
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          this.error.status = true;
          this.error.messages = error.error.messages || this.error.messages;
        }
      });
    }
  }
}
