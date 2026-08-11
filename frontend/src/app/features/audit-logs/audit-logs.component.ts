import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLog } from '../../models/user.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  logs = signal<AuditLog[]>([]);
  totalLogs = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(false);

  // Filters State
  usernameFilter: string = '';
  actionFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';

  actions = [
    'LOGIN',
    'LOGOUT',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'PASSWORD_RESET',
    'PROFILE_CHANGE',
    'ACCOUNT_ACTIVATE',
    'ACCOUNT_DEACTIVATE'
  ];

  ngOnInit() {
    this.fetchLogs();
  }

  fetchLogs() {
    this.isLoading.set(true);
    this.auditLogService.getAuditLogs({
      page: this.currentPage(),
      limit: 15,
      username: this.usernameFilter,
      action: this.actionFilter,
      startDate: this.startDateFilter,
      endDate: this.endDateFilter
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.logs.set(res.logs);
          this.totalLogs.set(res.total);
          this.totalPages.set(res.pages);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load audit logs:', err);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.fetchLogs();
  }

  onPrevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.fetchLogs();
    }
  }

  onNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.fetchLogs();
    }
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

  exportLogs(format: 'csv' | 'excel') {
    this.auditLogService.exportAuditLogs({
      username: this.usernameFilter,
      action: this.actionFilter,
      startDate: this.startDateFilter,
      endDate: this.endDateFilter,
      format
    }).subscribe({
      next: (blob) => {
        const ext = format === 'excel' ? 'xlsx' : 'csv';
        this.auditLogService.saveFile(blob, `audit-logs-${Date.now()}.${ext}`);
      },
      error: (err) => {
        console.error('Export failed:', err);
        alert('Failed to export logs.');
      }
    });
  }
}
