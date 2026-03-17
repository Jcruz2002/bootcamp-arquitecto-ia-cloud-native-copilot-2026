import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

function resolveApiErrorMessage(error: HttpErrorResponse): string {
  const payload = error.error as { detail?: string; message?: string } | null;

  if (payload?.detail) return payload.detail;
  if (payload?.message) return payload.message;
  if (error.status === 0) return 'No se pudo conectar con la API';
  return `Error HTTP ${error.status}`;
}

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.clearSession();
        notifications.show('Tu sesión expiró. Inicia sesión nuevamente.', 'error');
        router.navigateByUrl('/login');
      } else {
        notifications.show(resolveApiErrorMessage(error), 'error');
      }

      return throwError(() => error);
    }),
  );
};
