import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { LanguageService } from '../../services/language.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { User } from '../../models/user.model';
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
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  public langService = inject(LanguageService);
  public toastService = inject(ToastService);
  public confirmService = inject(ConfirmDialogService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isSubmitting = signal<boolean>(false);
  passwordSuccess = signal<boolean>(false);
  passwordError = signal<string | null>(null);

  activeTab = signal<'details' | 'edit' | 'password'>('details');

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
    this.refreshProfile();
  }

  refreshProfile() {
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.authService.currentUser.set(res.user);
          this.initForms(res.user);
        }
      },
      error: (err) => {
        console.error('Error fetching fresh profile:', err);
      }
    });
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
    const pendingData = user?.pendingUpdates?.status === 'PENDING' ? user?.pendingUpdates?.data : null;
    const getValue = (key: string, liveVal: any) => {
      if (pendingData && pendingData[key] !== undefined && pendingData[key] !== null) {
        return pendingData[key];
      }
      return liveVal;
    };

    const dobVal = getValue('dateOfBirth', user?.dateOfBirth);
    const formattedDob = dobVal ? new Date(dobVal).toISOString().substring(0, 10) : '';

    this.profileForm = this.fb.group({
      firstName: [getValue('firstName', user?.firstName || ''), Validators.required],
      fatherName: [getValue('fatherName', user?.fatherName || user?.lastName || ''), Validators.required],
      grandfatherName: [getValue('grandfatherName', user?.grandfatherName || ''), Validators.required],
      phoneNumber: [getValue('phoneNumber', user?.phoneNumber || ''), Validators.required],
      emergencyContactName: [getValue('emergencyContactName', user?.emergencyContactName || ''), Validators.required],
      emergencyContactPhone: [getValue('emergencyContactPhone', user?.emergencyContactPhone || ''), Validators.required],
      usesTelegram: [getValue('usesTelegram', user?.usesTelegram || 'Yes')],
      dateOfBirth: [formattedDob],
      gender: [getValue('gender', user?.gender || ''), Validators.required],
      maritalStatus: [getValue('maritalStatus', user?.maritalStatus || ''), Validators.required],
      spouseName: [getValue('spouseName', user?.spouseName || '')],
      educationLevel: [getValue('educationLevel', user?.educationLevel || '')],
      graduationInstitution: [getValue('graduationInstitution', user?.graduationInstitution || '')],
      fieldOfStudy: [getValue('fieldOfStudy', user?.fieldOfStudy || '')],
      joinedYear: [getValue('joinedYear', user?.joinedYear || '')],
      grewUpInChildrenClass: [getValue('grewUpInChildrenClass', user?.grewUpInChildrenClass || 'No')],
      sundaySchoolGrade: [getValue('sundaySchoolGrade', user?.sundaySchoolGrade || '')],
      notStudyingReason: [getValue('notStudyingReason', user?.notStudyingReason || '')],
      serviceSubSection: [getValue('serviceSubSection', user?.serviceSubSection || '')],
      servedInOtherParish: [getValue('servedInOtherParish', user?.servedInOtherParish || 'No')],
      previousServiceSubSection: [getValue('previousServiceSubSection', user?.previousServiceSubSection || '')],
      hasFatherConfessor: [getValue('hasFatherConfessor', user?.hasFatherConfessor || ''), Validators.required],
      fatherConfessorName: [getValue('fatherConfessorName', user?.fatherConfessorName || '')],
      fatherConfessorParish: [getValue('fatherConfessorParish', user?.fatherConfessorParish || '')],
      fatherConfessorPhone: [getValue('fatherConfessorPhone', user?.fatherConfessorPhone || '')],
      address: this.fb.group({
        street: [user?.address?.street || ''],
        city: [user?.address?.city || ''],
        state: [user?.address?.state || ''],
        zipCode: [user?.address?.zipCode || ''],
        country: [user?.address?.country || '']
      }),
      occupation: [getValue('occupation', user?.occupation || '')],
      department: [getValue('department', user?.department || '')],
      bio: [getValue('bio', user?.bio || '')]
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.userService.uploadProfilePicture(file).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Profile picture updated!');
            this.refreshProfile();
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to upload photo.');
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
      title: 'Submit Profile Changes',
      message: 'Are you sure you want to submit these profile changes for Admin approval?',
      confirmText: 'Submit for Approval',
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
            this.toastService.info(res.message || 'Your update has been submitted and is pending admin approval.');
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
          this.initForms(res.user);
        }
      }
    });
  }
}
