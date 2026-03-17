import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <aside
      class="toast"
      [class.toast-error]="notifications.state().type === 'error'"
      *ngIf="notifications.state().message"
    >
      <p>{{ notifications.state().message }}</p>
      <button type="button" (click)="notifications.clear()">Cerrar</button>
    </aside>
  `,
  styles: [
    `
      .toast {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 1000;
        background: #166534;
        color: #f0fdf4;
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
        display: flex;
        gap: 0.8rem;
        align-items: center;
        max-width: 420px;
        box-shadow: 0 12px 30px rgb(0 0 0 / 22%);
      }

      .toast p {
        margin: 0;
      }

      .toast button {
        background: transparent;
        border: 1px solid #d1fae5;
        color: inherit;
        border-radius: 8px;
        cursor: pointer;
      }

      .toast-error {
        background: #991b1b;
        color: #fee2e2;
      }
    `,
  ],
})
export class ToastComponent {
  readonly notifications = inject(NotificationService);
}
