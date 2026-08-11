import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { LanguageService } from '../../../services/language.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  public langService = inject(LanguageService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmDialogService);

  user = signal<User | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchUserDetails(id);
      } else {
        this.error.set('No user ID provided.');
        this.isLoading.set(false);
      }
    });
  }

  fetchUserDetails(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.userService.getUserById(id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.user) {
          this.user.set(res.user);
        } else {
          this.error.set('User profile not found.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to load user details.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }

  getInitials(user: User): string {
    const f = user.firstName ? user.firstName.charAt(0) : '';
    const l = user.fatherName ? user.fatherName.charAt(0) : (user.lastName ? user.lastName.charAt(0) : '');
    return (f + l).toUpperCase() || 'U';
  }

  async toggleActivation() {
    const u = this.user();
    if (!u) return;

    const nextStatus = !u.isActive;
    const actionName = nextStatus ? 'activate' : 'deactivate';

    const confirmed = await this.confirmService.confirm({
      title: `${nextStatus ? 'Activate' : 'Deactivate'} Member Account`,
      message: `Are you sure you want to ${actionName} the account for ${u.firstName} ${u.fatherName}?`,
      confirmText: nextStatus ? 'Activate Account' : 'Deactivate Account',
      type: nextStatus ? 'info' : 'warning'
    });

    if (!confirmed) return;

    this.userService.toggleActivation(u._id, nextStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.user.update(curr => curr ? { ...curr, isActive: nextStatus } : null);
          this.toastService.success(`Member account ${actionName}d successfully.`);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || `Failed to ${actionName} account.`);
      }
    });
  }

  async deleteUser() {
    const u = this.user();
    if (!u) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Delete Member Record',
      message: `Are you sure you want to delete member: ${u.firstName} ${u.fatherName}? This action soft-deletes the member record.`,
      confirmText: 'Delete Member',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    this.userService.deleteUser(u._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Member ${u.firstName} ${u.fatherName} deleted successfully.`);
          this.router.navigate(['/users']);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete member.');
      }
    });
  }

  async resetPassword() {
    const u = this.user();
    if (!u) return;

    const newPass = prompt(`Enter new password for @${u.username} (min 6 characters):`);
    if (!newPass || newPass.trim().length < 6) {
      if (newPass !== null) {
        this.toastService.warning('Password must be at least 6 characters long.');
      }
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Reset Member Password',
      message: `Confirm password reset for @${u.username}?`,
      confirmText: 'Reset Password',
      type: 'warning'
    });

    if (!confirmed) return;

    this.userService.resetPassword(u._id, newPass).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Password reset for @${u.username} successfully.`);
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to reset password.');
      }
    });
  }
}
