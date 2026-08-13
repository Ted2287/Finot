import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);

  reportTypes = [
    { id: 'registration', name: 'User Registration Report' },
    { id: 'active', name: 'Active User Report' },
    { id: 'inactive', name: 'Inactive User Report' },
    { id: 'activity', name: 'User Activity Report' },
    { id: 'login-history', name: 'Login History Report' }
  ];

  selectedReport = signal<string>('registration');
  selectedFormat = signal<string>('excel');
  
  isLoading = signal<boolean>(false);
  isDownloading = signal<boolean>(false);

  previewData = signal<any[]>([]);
  previewColumns = signal<any[]>([]);

  // Pagination State (5 per page)
  currentPage = signal<number>(1);
  pageSize = 5;

  // Selection State
  selectedRowIndexes = signal<Set<number>>(new Set());

  ngOnInit() {
    this.fetchPreview();
  }

  getSelectedReportName(): string {
    return this.reportTypes.find(r => r.id === this.selectedReport())?.name || '';
  }

  selectReport(id: string) {
    this.selectedReport.set(id);
    this.currentPage.set(1);
    this.clearSelection();
    this.fetchPreview();
  }

  get paginatedPreviewData(): any[] {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.previewData().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.previewData().length / this.pageSize));
  }

  getGlobalIndex(localIdx: number): number {
    return (this.currentPage() - 1) * this.pageSize + localIdx;
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

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const set = new Set<number>(this.selectedRowIndexes());
    const start = (this.currentPage() - 1) * this.pageSize;
    const pageItems = this.paginatedPreviewData;
    pageItems.forEach((_, idx) => {
      const globalIdx = start + idx;
      if (checked) set.add(globalIdx);
      else set.delete(globalIdx);
    });
    this.selectedRowIndexes.set(set);
  }

  toggleSelectRow(globalIdx: number) {
    const set = new Set<number>(this.selectedRowIndexes());
    if (set.has(globalIdx)) {
      set.delete(globalIdx);
    } else {
      set.add(globalIdx);
    }
    this.selectedRowIndexes.set(set);
  }

  isSelected(globalIdx: number): boolean {
    return this.selectedRowIndexes().has(globalIdx);
  }

  isAllSelected(): boolean {
    const pageItems = this.paginatedPreviewData;
    if (pageItems.length === 0) return false;
    const start = (this.currentPage() - 1) * this.pageSize;
    return pageItems.every((_, idx) => this.selectedRowIndexes().has(start + idx));
  }

  clearSelection() {
    this.selectedRowIndexes.set(new Set());
  }

  fetchPreview() {
    this.isLoading.set(true);
    this.reportService.getReportPreview(this.selectedReport()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.previewData.set(res.data);
          this.setColumnsForReport(this.selectedReport());
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching preview:', err);
        this.toastService.error('Failed to load report preview.');
        this.isLoading.set(false);
      }
    });
  }

  setColumnsForReport(type: string) {
    switch (type) {
      case 'registration':
        this.previewColumns.set([
          { header: 'Username', key: 'username' },
          { header: 'Email', key: 'email' },
          { header: 'First Name', key: 'firstName' },
          { header: 'Education', key: 'educationLevel' },
          { header: 'Graduation', key: 'graduationInstitution' },
          { header: 'Status', key: 'statusText' }
        ]);
        break;
      case 'active':
        this.previewColumns.set([
          { header: 'Username', key: 'username' },
          { header: 'Email', key: 'email' },
          { header: 'First Name', key: 'firstName' },
          { header: 'Last Name', key: 'lastName' },
          { header: 'Education', key: 'educationLevel' },
          { header: 'Institution', key: 'graduationInstitution' }
        ]);
        break;
      case 'inactive':
        this.previewColumns.set([
          { header: 'Username', key: 'username' },
          { header: 'Email', key: 'email' },
          { header: 'First Name', key: 'firstName' },
          { header: 'Last Name', key: 'lastName' },
          { header: 'Created At', key: 'createdAtDate' }
        ]);
        break;
      case 'activity':
        this.previewColumns.set([
          { header: 'User', key: 'username' },
          { header: 'Action', key: 'action' },
          { header: 'IP Address', key: 'ipAddress' },
          { header: 'Browser', key: 'browserInfo' },
          { header: 'Date', key: 'createdAtDate' }
        ]);
        break;
      case 'login-history':
        this.previewColumns.set([
          { header: 'Username', key: 'username' },
          { header: 'Status', key: 'status' },
          { header: 'IP Address', key: 'ipAddress' },
          { header: 'Reason', key: 'failureReason' },
          { header: 'Date', key: 'createdAtDate' }
        ]);
        break;
    }
  }

  formatValue(val: any): string {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  downloadReport() {
    this.isDownloading.set(true);
    const type = this.selectedReport();
    
    this.reportService.downloadReport(type, 'excel').subscribe({
      next: (blob) => {
        this.reportService.saveFile(blob, `report-${type}-${Date.now()}.xlsx`);
        this.toastService.success(`Excel report downloaded successfully.`);
        this.isDownloading.set(false);
      },
      error: (err) => {
        console.error('Download failed:', err);
        this.toastService.error('Failed to download Excel report.');
        this.isDownloading.set(false);
      }
    });
  }
}
