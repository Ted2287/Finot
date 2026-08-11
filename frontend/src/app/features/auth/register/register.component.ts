import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';
import { ThemeService } from '../../../services/theme.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styles: [`
    :host {
      display: block;
    }
    .custom-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public langService = inject(LanguageService);
  public themeService = inject(ThemeService);
  private toastService = inject(ToastService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedPhotoPreview = signal<string | null>(null);

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

  registerForm!: FormGroup;

  ngOnInit() {
    this.registerForm = this.fb.group({
      // Account Credentials
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      // Section 1: Personal Info
      firstName: ['', Validators.required],
      fatherName: ['', Validators.required],
      grandfatherName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: [''],
      maritalStatus: ['', Validators.required],
      spouseName: [''],

      // Section 2: Contact & Emergency
      phoneNumber: ['', Validators.required],
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', Validators.required],
      usesTelegram: ['Yes'],

      // Section 3: Educational Background
      educationLevel: [''],
      graduationInstitution: [''],
      fieldOfStudy: [''],

      // Section 4: Sunday School & Service
      joinedYear: [''],
      grewUpInChildrenClass: ['No'],
      sundaySchoolGrade: [''],
      notStudyingReason: [''],
      serviceSubSection: [''],
      servedInOtherParish: ['No'],
      previousServiceSubSection: [''],

      // Section 5: Father Confessor
      hasFatherConfessor: ['', Validators.required],
      fatherConfessorName: [''],
      fatherConfessorParish: [''],
      fatherConfessorPhone: ['']
    });
  }

  isMarried(): boolean {
    const val = this.registerForm.get('maritalStatus')?.value;
    return val === 'Married' || val === 'ያገባ';
  }

  onMaritalStatusChange() {
    const spouseControl = this.registerForm.get('spouseName');
    if (this.isMarried()) {
      spouseControl?.setValidators([Validators.required]);
    } else {
      spouseControl?.clearValidators();
      spouseControl?.setValue('');
    }
    spouseControl?.updateValueAndValidity();
  }

  isNotStudying(): boolean {
    const val = this.registerForm.get('sundaySchoolGrade')?.value;
    return val === 'Not Studying' || val === 'እየተማርኩ አይደለም';
  }

  onSundaySchoolGradeChange() {
    const reasonCtrl = this.registerForm.get('notStudyingReason');
    if (!this.isNotStudying()) {
      reasonCtrl?.setValue('');
    }
  }

  hasServedOtherParish(): boolean {
    const val = this.registerForm.get('servedInOtherParish')?.value;
    return val === 'Yes' || val === 'አዎ አገልግያለሁ' || val === 'Yes, I have served';
  }

  onServedOtherParishChange() {
    const prevSubCtrl = this.registerForm.get('previousServiceSubSection');
    if (!this.hasServedOtherParish()) {
      prevSubCtrl?.setValue('');
    }
  }

  hasFatherConfessor(): boolean {
    const val = this.registerForm.get('hasFatherConfessor')?.value;
    return val === 'Yes' || val === 'አዎ አለኝ' || val === 'Yes, I have';
  }

  onFatherConfessorChange() {
    const fcName = this.registerForm.get('fatherConfessorName');
    const fcParish = this.registerForm.get('fatherConfessorParish');
    const fcPhone = this.registerForm.get('fatherConfessorPhone');
    
    if (this.hasFatherConfessor()) {
      fcName?.setValidators([Validators.required]);
    } else {
      fcName?.clearValidators();
      fcName?.setValue('');
      fcParish?.setValue('');
      fcPhone?.setValue('');
    }
    fcName?.updateValueAndValidity();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhotoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  hasError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getInvalidFields(): string[] {
    const invalid: string[] = [];
    const controls = this.registerForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onSubmit() {
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      const invalidFields = this.getInvalidFields();
      const msg = this.langService.currentLang() === 'am' 
        ? `እባክዎን በቅጹ ላይ ያሉትን አስፈላጊ መረጃዎች ይሙሉ (ያልተሞሉ፡ ${invalidFields.join(', ')})`
        : `Please complete all required fields: ${invalidFields.join(', ')}`;
      this.errorMessage.set(msg);
      this.toastService.warning(msg);
      return;
    }

    this.isLoading.set(true);

    const formVal = { ...this.registerForm.value };
    formVal.lastName = formVal.fatherName; // fallback for backend compatibility
    if (!formVal.dateOfBirth) {
      formVal.dateOfBirth = null;
    }
    if (!formVal.educationLevel) {
      formVal.educationLevel = '';
    }

    this.authService.register(formVal).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.toastService.success('Registration completed successfully! Welcome to Finot.');
          this.router.navigate(['/profile']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const errList = err.error?.errors ? err.error.errors.join('\n• ') : null;
        const msg = errList 
          ? `Registration Error:\n• ${errList}` 
          : (err.error?.message || 'Failed to register account. Please check inputs.');
        this.errorMessage.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
