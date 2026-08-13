import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit-logs`;

  // Get paginated audit logs with optional filters
  getAuditLogs(params: {
    page?: number;
    limit?: number;
    username?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<{ success: boolean; total: number; page: number; pages: number; logs: AuditLog[] }> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.username) httpParams = httpParams.set('username', params.username);
    if (params.action) httpParams = httpParams.set('action', params.action);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<{ success: boolean; total: number; page: number; pages: number; logs: AuditLog[] }>(
      this.apiUrl,
      { params: httpParams }
    );
  }

  // Export filtered audit logs as Excel
  exportAuditLogs(params: {
    username?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    format?: 'excel';
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', params.format || 'excel');

    if (params.username) httpParams = httpParams.set('username', params.username);
    if (params.action) httpParams = httpParams.set('action', params.action);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Utility to download blob
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
