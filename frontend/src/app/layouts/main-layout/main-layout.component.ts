import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
  router = inject(Router);
  
  isSidebarOpen = signal<boolean>(false);
  isCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout().subscribe();
  }

  getCurrentPage(): string {
    const url = this.router.url;
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Dashboard';
  }
}
