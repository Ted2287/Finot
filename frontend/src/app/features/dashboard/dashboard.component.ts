import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { DashboardStats } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private reportService = inject(ReportService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal<boolean>(true);

  currentPage = signal<number>(1);
  pageSize = 5;

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.isLoading.set(true);
    this.reportService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats.set(res.stats);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.isLoading.set(false);
      }
    });
  }

  get paginatedLogs(): any[] {
    const logs = this.stats()?.recentActivity || [];
    const start = (this.currentPage() - 1) * this.pageSize;
    return logs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const logs = this.stats()?.recentActivity || [];
    return Math.ceil(logs.length / this.pageSize) || 1;
  }

  onPrevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.update(p => p + 1);
    }
  }

  getActivePercentage(): number {
    const s = this.stats();
    if (!s || s.totalUsers === 0) return 0;
    return Math.round((s.activeUsers / s.totalUsers) * 100);
  }

  getBarHeight(value: number): number {
    const s = this.stats();
    if (!s) return 0;
    const maxVal = Math.max(...s.monthlyTrends.map(m => m.value), 10);
    return Math.max((value / maxVal) * 100, 5); // return percentage, min 5% for visibility
  }

  getLoginSuccessRate(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.loginStats.success + s.loginStats.failed;
    if (total === 0) return 100;
    return (s.loginStats.success / total) * 100;
  }

  getActionClass(action: string): string {
    switch (action) {
      case 'LOGIN': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';
      case 'LOGOUT': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      case 'USER_CREATE': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400';
      case 'USER_DELETE': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400';
      case 'PASSWORD_RESET': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400';
      default: return 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400';
    }
  }

  getDetailsString(details: any): string {
    if (!details) return '';
    return JSON.stringify(details);
  }
}
