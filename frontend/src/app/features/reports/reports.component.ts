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

  ngOnInit() {
    this.fetchPreview();
  }

  getSelectedReportName(): string {
    return this.reportTypes.find(r => r.id === this.selectedReport())?.name || '';
  }

  selectReport(id: string) {
    this.selectedReport.set(id);
    this.fetchPreview();
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
