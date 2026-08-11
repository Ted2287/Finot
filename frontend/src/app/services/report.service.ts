import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  // Fetch admin dashboard stats
  getDashboardStats(): Observable<{ success: boolean; stats: DashboardStats }> {
    return this.http.get<{ success: boolean; stats: DashboardStats }>(`${this.apiUrl}/stats`);
  }

  // Fetch report data in JSON format for live preview
  getReportPreview(reportType: string): Observable<{ success: boolean; title: string; data: any[] }> {
    return this.http.get<{ success: boolean; title: string; data: any[] }>(`${this.apiUrl}/export/${reportType}`);
  }

  // Get report file as a binary blob for Excel
  downloadReport(reportType: string, format: string = 'excel'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/export/${reportType}`, {
      params,
      responseType: 'blob'
    });
  }

  // Utility method to trigger client-side file save dialog
  saveFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
