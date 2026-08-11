import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { LanguageService } from '../../services/language.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './users.component.html',
  styles: [`
    :host {
      display: block;
    }
    .custom-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
    }
    .dark .custom-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.05);
    }
  `]
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  public langService = inject(LanguageService);
  public toastService = inject(ToastService);
  public confirmService = inject(ConfirmDialogService);

  users = signal<User[]>([]);
  totalUsers = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(false);

  // Filters State
  search = signal<string>('');
  role = signal<string>('');
  isActive = signal<string>('');

  // Add/Edit Modal
  isModalOpen = signal<boolean>(false);
  editUserId = signal<string | null>(null);
  userForm!: FormGroup;

  // Reset Modal
  isResetModalOpen = signal<boolean>(false);
  resetUserId = signal<string>('');
  resetUsername = signal<string>('');
  resetForm!: FormGroup;

  universities = [
    'Addis Ababa University',
    'Bahir Dar University',
    'Hawassa University',
    'Jimma University',
    'Mekelle University',
    'Arba Minch University',
    'University of Gondar',
    'Haramaya University',
    'Adama Science and Technology University',
    'Wollo University',
    'Debre Markos University',
    'Debre Birhan University',
    'Dire Dawa University',
    'Dilla University',
    'Ambo University',
    'Axum University',
    'Semera University',
    'Jijiga University',
    'Wachemo University',
    'Wolaita Sodo University',
    'Mada Walabu University',
    'Bule Hora University',
    'Kotebe Metropolitan University',
    'Ethiopian Civil Service University',
    'Debre Tabor University',
    'Raya University',
    'Werabe University'
  ];

  ngOnInit() {
    this.fetchUsers();
    this.initUserForm();
    
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  initUserForm() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      fatherName: ['', Validators.required],
      grandfatherName: ['', Validators.required],
      username: [''],
      password: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      gender: ['', Validators.required],
      role: ['USER', Validators.required],
      maritalStatus: ['', Validators.required],
      spouseName: [''],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
      usesTelegram: ['Yes'],
      educationLevel: [''],
      graduationInstitution: [''],
      fieldOfStudy: [''],
      joinedYear: [''],
      grewUpInChildrenClass: ['No'],
      sundaySchoolGrade: [''],
      notStudyingReason: [''],
      serviceSubSection: [''],
      servedInOtherParish: ['No'],
      previousServiceSubSection: [''],
      hasFatherConfessor: ['', Validators.required],
      fatherConfessorName: [''],
      fatherConfessorParish: [''],
      fatherConfessorPhone: ['']
    });
  }

  fetchUsers() {
    this.isLoading.set(true);
    this.userService.getUsers({
      page: this.currentPage(),
      limit: 10,
      search: this.search(),
      role: this.role(),
      isActive: this.isActive()
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.users.set(res.users);
          this.totalUsers.set(res.total);
          this.totalPages.set(res.pages);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(e: any) {
    this.search.set(e.target.value);
    this.currentPage.set(1);
    this.fetchUsers();
  }

  onFilterRole(e: any) {
    this.role.set(e.target.value);
    this.currentPage.set(1);
    this.fetchUsers();
  }

  onFilterStatus(e: any) {
    this.isActive.set(e.target.value);
    this.currentPage.set(1);
    this.fetchUsers();
  }

  onPrevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.fetchUsers();
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.fetchUsers();
    }
  }

  async toggleActivation(user: User) {
    const nextStatus = !user.isActive;
    const actionName = nextStatus ? 'activate' : 'deactivate';
    
    const confirmed = await this.confirmService.confirm({
      title: `${nextStatus ? 'Activate' : 'Deactivate'} Member Account`,
      message: `Are you sure you want to ${actionName} the account for ${user.firstName} ${user.fatherName}?`,
      confirmText: nextStatus ? 'Activate Account' : 'Deactivate Account',
      type: nextStatus ? 'info' : 'warning'
    });

    if (!confirmed) return;

    this.userService.toggleActivation(user._id, nextStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Member account ${actionName}d successfully.`);
          this.fetchUsers();
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || `Failed to ${actionName} account.`);
      }
    });
  }

  async deleteUser(user: User) {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Member Record',
      message: `Are you sure you want to delete member: ${user.firstName} ${user.fatherName}? This action soft-deletes the member record.`,
      confirmText: 'Delete Member',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    this.userService.deleteUser(user._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Member ${user.firstName} ${user.fatherName} deleted successfully.`);
          this.fetchUsers();
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete member.');
      }
    });
  }

  openCreateModal() {
    this.editUserId.set(null);
    this.initUserForm();
    
    const usernameCtrl = this.userForm.get('username');
    const passwordCtrl = this.userForm.get('password');
    usernameCtrl?.setValidators([Validators.required, Validators.minLength(3)]);
    passwordCtrl?.setValidators([Validators.required, Validators.minLength(6)]);
    usernameCtrl?.updateValueAndValidity();
    passwordCtrl?.updateValueAndValidity();
    
    this.isModalOpen.set(true);
  }

  openEditModal(user: User) {
    this.editUserId.set(user._id);
    
    this.userForm = this.fb.group({
      firstName: [user.firstName, Validators.required],
      fatherName: [user.fatherName || user.lastName || '', Validators.required],
      grandfatherName: [user.grandfatherName || '', Validators.required],
      username: [user.username],
      password: [''],
      email: [user.email, [Validators.required, Validators.email]],
      phoneNumber: [user.phoneNumber || '', Validators.required],
      gender: [user.gender || '', Validators.required],
      role: [user.role, Validators.required],
      maritalStatus: [user.maritalStatus || '', Validators.required],
      spouseName: [user.spouseName || ''],
      emergencyContactName: [user.emergencyContactName || '', Validators.required],
      emergencyContactPhone: [user.emergencyContactPhone || '', Validators.required],
      usesTelegram: [user.usesTelegram || 'Yes'],
      educationLevel: [user.educationLevel || ''],
      graduationInstitution: [user.graduationInstitution || ''],
      fieldOfStudy: [user.fieldOfStudy || ''],
      joinedYear: [user.joinedYear || ''],
      grewUpInChildrenClass: [user.grewUpInChildrenClass || 'No'],
      sundaySchoolGrade: [user.sundaySchoolGrade || ''],
      notStudyingReason: [user.notStudyingReason || ''],
      serviceSubSection: [user.serviceSubSection || ''],
      servedInOtherParish: [user.servedInOtherParish || 'No'],
      previousServiceSubSection: [user.previousServiceSubSection || ''],
      hasFatherConfessor: [user.hasFatherConfessor || '', Validators.required],
      fatherConfessorName: [user.fatherConfessorName || ''],
      fatherConfessorParish: [user.fatherConfessorParish || ''],
      fatherConfessorPhone: [user.fatherConfessorPhone || '']
    });

    this.onModalMaritalStatusChange();
    this.onFatherConfessorChange();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  isModalMarried(): boolean {
    const val = this.userForm.get('maritalStatus')?.value;
    return val === 'Married' || val === 'ያገባ';
  }

  onModalMaritalStatusChange() {
    const spouseCtrl = this.userForm.get('spouseName');
    if (this.isModalMarried()) {
      spouseCtrl?.setValidators([Validators.required]);
    } else {
      spouseCtrl?.clearValidators();
      spouseCtrl?.setValue('');
    }
    spouseCtrl?.updateValueAndValidity();
  }

  isNotStudying(): boolean {
    const val = this.userForm.get('sundaySchoolGrade')?.value;
    return val === 'Not Studying' || val === 'እየተማርኩ አይደለም';
  }

  hasServedOtherParish(): boolean {
    const val = this.userForm.get('servedInOtherParish')?.value;
    return val === 'Yes' || val === 'አዎ አገልግያለሁ' || val === 'Yes, I have served';
  }

  hasFatherConfessor(): boolean {
    const val = this.userForm.get('hasFatherConfessor')?.value;
    return val === 'Yes' || val === 'አዎ አለኝ' || val === 'Yes, I have';
  }

  onFatherConfessorChange() {
    const fcName = this.userForm.get('fatherConfessorName');
    if (this.hasFatherConfessor()) {
      fcName?.setValidators([Validators.required]);
    } else {
      fcName?.clearValidators();
      fcName?.setValue('');
    }
    fcName?.updateValueAndValidity();
  }

  async onSubmitForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastService.warning('Please fill out all required form fields highlighted in red.');
      return;
    }

    const payload = { ...this.userForm.value };
    payload.lastName = payload.fatherName;
    const userId = this.editUserId();

    if (userId) {
      const confirmed = await this.confirmService.confirm({
        title: 'Save Member Changes',
        message: `Are you sure you want to update member details for ${payload.firstName} ${payload.fatherName}?`,
        confirmText: 'Save Changes',
        type: 'warning'
      });

      if (!confirmed) return;

      delete payload.username;
      delete payload.password;
      this.userService.updateUser(userId, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Member updated successfully!');
            this.closeModal();
            this.fetchUsers();
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update member.');
        }
      });
    } else {
      this.userService.createUser(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('New member registered successfully!');
            this.closeModal();
            this.fetchUsers();
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create user.');
        }
      });
    }
  }

  openResetModal(user: User) {
    this.resetUserId.set(user._id);
    this.resetUsername.set(user.username);
    this.resetForm.reset();
    this.isResetModalOpen.set(true);
  }

  closeResetModal() {
    this.isResetModalOpen.set(false);
  }

  async onSubmitReset() {
    if (this.resetForm.invalid) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Reset Member Password',
      message: `Are you sure you want to reset password for @${this.resetUsername()}?`,
      confirmText: 'Reset Password',
      type: 'warning'
    });

    if (!confirmed) return;

    this.userService.resetPassword(this.resetUserId(), this.resetForm.value.password).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Password reset for @${this.resetUsername()} successfully.`);
          this.closeResetModal();
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to reset password.');
      }
    });
  }
}
