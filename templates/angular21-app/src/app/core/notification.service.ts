import { Injectable, signal } from '@angular/core';

export type NotificationType = 'ok' | 'error';

export type NotificationState = {
  message: string;
  type: NotificationType;
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly state = signal<NotificationState>({ message: '', type: 'ok' });
  private hideTimer?: ReturnType<typeof setTimeout>;

  show(message: string, type: NotificationType = 'ok', ms = 3200): void {
    if (!message) return;
    this.state.set({ message, type });

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.hideTimer = setTimeout(() => {
      this.clear();
    }, ms);
  }

  clear(): void {
    this.state.set({ message: '', type: 'ok' });
  }
}
