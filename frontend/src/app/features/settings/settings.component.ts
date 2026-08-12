import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  settingsForm!: FormGroup;
  isSaving = signal<boolean>(false);

  ngOnInit() {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      twoFactorEnabled: [false]
    });

    // Populate fields from current settings
    const settings = this.authService.userSettings();
    if (settings) {
      this.settingsForm.patchValue({
        emailNotifications: settings.emailNotifications,
        twoFactorEnabled: settings.twoFactorEnabled
      });
    }
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.authService.userSettings()?.theme || this.themeService.currentTheme();
  }

  setTheme(theme: 'light' | 'dark') {
    // Immediately apply theme visually
    this.themeService.setTheme(theme);

    // Save preference to backend database
    this.isSaving.set(true);
    this.authService.updateSettings({ theme }).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false)
    });
  }

  onToggleChange() {
    this.isSaving.set(true);
    this.authService.updateSettings(this.settingsForm.value).subscribe({
      next: () => this.isSaving.set(false),
      error: () => this.isSaving.set(false)
    });
  }
}
