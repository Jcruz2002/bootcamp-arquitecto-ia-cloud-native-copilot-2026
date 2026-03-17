import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-home-redirect',
  template: `<p>Redireccionando...</p>`,
})
export class HomeRedirectComponent {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/users');
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}
