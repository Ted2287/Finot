import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './main-layout.component.html',
  styles: [`
    :host {
      display: block;
    }
    
    ::ng-deep .active-link {
      @apply bg-primary-500 text-white shadow-md shadow-primary-500/20 hover:bg-primary-600 !important;
    }
    
    ::ng-deep .active-link span, ::ng-deep .active-link .material-icons {
      @apply text-white !important;
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  langService = inject(LanguageService);
  router = inject(Router);
  
  isSidebarOpen = signal<boolean>(false);
  isCollapsed = signal<boolean>(false);
  isUserMenuOpen = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  logout() {
    this.closeUserMenu();
    this.authService.logout().subscribe();
  }

  imageError = signal<boolean>(false);

  getProfileImageUrl(): string | null {
    if (this.imageError()) return null;
    const user = this.authService.currentUser();
    if (!user || !user.profilePicture) return null;
    if (user.profilePicture.startsWith('data:') || user.profilePicture.startsWith('http')) {
      return user.profilePicture;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}/${user.profilePicture}`;
  }

  onImageError() {
    this.imageError.set(true);
  }

  getCurrentPage(): string {
    const url = this.router.url;
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Dashboard';
  }
}
