import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { UserItem, UsersService } from '../../core/users.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly users = signal<UserItem[]>([]);
  readonly loadingUsers = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal('');
  readonly editingUser = signal<UserItem | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly notifications: NotificationService,
  ) {
    this.reloadUsers();
  }

  get isEdit(): boolean {
    return this.editingUser() !== null;
  }

  reloadUsers(): void {
    this.loadingUsers.set(true);
    this.usersService
      .list()
      .pipe(finalize(() => this.loadingUsers.set(false)))
      .subscribe({
        next: (data) => this.users.set(Array.isArray(data) ? data : []),
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const payload = this.form.getRawValue();
    const current = this.editingUser();
    const request$ = current
      ? this.usersService.update(current.id, payload)
      : this.usersService.create(payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.notifications.show(
          current ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
          'ok',
        );
        this.cancelEdit();
        this.reloadUsers();
      },
    });
  }

  edit(user: UserItem): void {
    this.editingUser.set(user);
    this.form.patchValue({ name: user.name, email: user.email });
  }

  cancelEdit(): void {
    this.editingUser.set(null);
    this.form.reset();
  }

  remove(user: UserItem): void {
    if (!globalThis.confirm(`¿Eliminar a "${user.name}"?`)) {
      return;
    }

    this.deletingId.set(user.id);
    this.usersService
      .remove(user.id)
      .pipe(finalize(() => this.deletingId.set('')))
      .subscribe({
        next: () => {
          this.notifications.show(`Usuario "${user.name}" eliminado`, 'ok');
          if (this.editingUser()?.id === user.id) {
            this.cancelEdit();
          }
          this.reloadUsers();
        },
      });
  }

  logout(): void {
    this.authService.clearSession();
    this.notifications.show('Sesión cerrada correctamente', 'ok');
    globalThis.location.href = '/login';
  }
}
