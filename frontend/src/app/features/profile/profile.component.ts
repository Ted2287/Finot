import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { LanguageService } from '../../services/language.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProfileComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);
  public langService = inject(LanguageService);
  toastService = inject(ToastService);
  confirmService = inject(ConfirmDialogService);
  private fb = inject(FormBuilder);

  activeTab = signal<string>('details');
  isSubmitting = signal<boolean>(false);
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // Alerts
  passwordSuccess = signal<boolean>(false);
  passwordError = signal<string | null>(null);

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
    const user = this.authService.currentUser();
    this.initForms(user);
  }

  getInitials(user: User): string {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const father = user.fatherName ? user.fatherName.charAt(0).toUpperCase() : (user.lastName ? user.lastName.charAt(0).toUpperCase() : '');
    return `${first}${father}` || 'U';
  }

  getProfileImageUrl(): string | null {
    const user = this.authService.currentUser();
    if (!user || !user.profilePicture) return null;
    if (user.profilePicture.startsWith('http')) return user.profilePicture;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${user.profilePicture}`;
  }

  initForms(user: User | null) {
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      fatherName: [user?.fatherName || user?.lastName || '', Validators.required],
      grandfatherName: [user?.grandfatherName || '', Validators.required],
      phoneNumber: [user?.phoneNumber || '', Validators.required],
      emergencyContactName: [user?.emergencyContactName || '', Validators.required],
      emergencyContactPhone: [user?.emergencyContactPhone || '', Validators.required],
      usesTelegram: [user?.usesTelegram || 'Yes'],
      dateOfBirth: [user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().substring(0, 10) : ''],
      gender: [user?.gender || '', Validators.required],
      maritalStatus: [user?.maritalStatus || '', Validators.required],
      spouseName: [user?.spouseName || ''],
      educationLevel: [user?.educationLevel || ''],
      graduationInstitution: [user?.graduationInstitution || ''],
      fieldOfStudy: [user?.fieldOfStudy || ''],
      joinedYear: [user?.joinedYear || ''],
      grewUpInChildrenClass: [user?.grewUpInChildrenClass || 'No'],
      sundaySchoolGrade: [user?.sundaySchoolGrade || ''],
      notStudyingReason: [user?.notStudyingReason || ''],
      serviceSubSection: [user?.serviceSubSection || ''],
      servedInOtherParish: [user?.servedInOtherParish || 'No'],
      previousServiceSubSection: [user?.previousServiceSubSection || ''],
      hasFatherConfessor: [user?.hasFatherConfessor || '', Validators.required],
      fatherConfessorName: [user?.fatherConfessorName || ''],
      fatherConfessorParish: [user?.fatherConfessorParish || ''],
      fatherConfessorPhone: [user?.fatherConfessorPhone || ''],
      address: this.fb.group({
        street: [user?.address?.street || ''],
        city: [user?.address?.city || ''],
        state: [user?.address?.state || ''],
        zipCode: [user?.address?.zipCode || ''],
        country: [user?.address?.country || '']
      }),
      occupation: [user?.occupation || ''],
      department: [user?.department || ''],
      bio: [user?.bio || '']
    });

    this.onProfileMaritalStatusChange();
    this.onFatherConfessorChange();

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  hasError(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isProfileMarried(): boolean {
    const val = this.profileForm.get('maritalStatus')?.value;
    return val === 'Married' || val === 'ያገባ';
  }

  onProfileMaritalStatusChange() {
    const spouseCtrl = this.profileForm.get('spouseName');
    if (this.isProfileMarried()) {
      spouseCtrl?.setValidators([Validators.required]);
    } else {
      spouseCtrl?.clearValidators();
      spouseCtrl?.setValue('');
    }
    spouseCtrl?.updateValueAndValidity();
  }

  isNotStudying(): boolean {
    const val = this.profileForm.get('sundaySchoolGrade')?.value;
    return val === 'Not Studying' || val === 'እየተማርኩ አይደለም';
  }

  hasServedOtherParish(): boolean {
    const val = this.profileForm.get('servedInOtherParish')?.value;
    return val === 'Yes' || val === 'አዎ አገልግያለሁ' || val === 'Yes, I have served';
  }

  hasFatherConfessor(): boolean {
    const val = this.profileForm.get('hasFatherConfessor')?.value;
    return val === 'Yes' || val === 'አዎ አለኝ' || val === 'Yes, I have';
  }

  onFatherConfessorChange() {
    const fcName = this.profileForm.get('fatherConfessorName');
    if (this.hasFatherConfessor()) {
      fcName?.setValidators([Validators.required]);
    } else {
      fcName?.clearValidators();
      fcName?.setValue('');
    }
    fcName?.updateValueAndValidity();
  }

  onFileSelected(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.userService.uploadProfilePicture(file).subscribe({
        next: (res) => {
          if (res.success) {
            const current = this.authService.currentUser();
            if (current) {
              const updated = { ...current, profilePicture: res.profilePicture };
              localStorage.setItem('user', JSON.stringify(updated));
              this.authService.currentUser.set(updated);
            }
            this.toastService.success('Profile picture updated successfully!');
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to upload image.');
        }
      });
    }
  }

  async onSubmitProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastService.warning('Please fill out all required fields highlighted in red.');
      return;
    }

    const confirmed = await this.confirmService.confirm({
      title: 'Save Profile Changes',
      message: 'Are you sure you want to update your profile information?',
      confirmText: 'Save Profile',
      type: 'warning'
    });

    if (!confirmed) return;
    
    this.isSubmitting.set(true);
    const payload = { ...this.profileForm.value };
    payload.lastName = payload.fatherName;
    if (!payload.dateOfBirth) {
      payload.dateOfBirth = null;
    }

    this.userService.updateProfile(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.success) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.authService.currentUser.set(res.user);
          this.initForms(res.user);
          if (res.isPending) {
            this.toastService.info(res.message || 'Profile update request submitted for Admin approval.');
          } else {
            this.toastService.success('Profile details updated successfully!');
          }
          this.activeTab.set('details');
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errList = err.error?.errors ? err.error.errors.join('\n• ') : null;
        const msg = errList 
          ? `Validation Error:\n• ${errList}` 
          : (err.error?.message || 'Failed to update profile details.');
        this.toastService.error(msg);
      }
    });
  }

  onSubmitPassword() {
    if (this.passwordForm.invalid) return;

    this.passwordSuccess.set(false);
    this.passwordError.set(null);

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.passwordSuccess.set(true);
          this.toastService.success('Password changed successfully!');
          this.passwordForm.reset();
        }
      },
      error: (err) => {
        const msg = err.error?.message || 'Failed to update password.';
        this.passwordError.set(msg);
        this.toastService.error(msg);
      }
    });
  }

  dismissPendingStatus() {
    this.userService.clearPendingStatus().subscribe({
      next: (res) => {
        if (res.success) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.authService.currentUser.set(res.user);
        }
      }
    });
  }
}
