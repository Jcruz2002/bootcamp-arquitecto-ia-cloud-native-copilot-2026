import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);

  loading = false;
  error = '';

  readonly form = this.formBuilder.nonNullable.group({
    username: ['admin', [Validators.required, Validators.minLength(3)]],
    password: ['password', [Validators.required, Validators.minLength(4)]],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly notifications: NotificationService,
    private readonly router: Router,
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/users');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { username, password } = this.form.getRawValue();

    this.authService
      .login(username, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          if (!response.accessToken) {
            this.error = 'La API no devolvió un token válido';
            return;
          }

          this.authService.setToken(response.accessToken);
          this.notifications.show('Inicio de sesión exitoso', 'ok');
          this.router.navigateByUrl('/users');
        },
        error: (err) => {
          this.error = err?.error?.message || 'No se pudo iniciar sesión';
        },
      });
  }
}
