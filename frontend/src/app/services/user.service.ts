import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  // Get current logged-in user profile details
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`);
  }

  // Update current user profile details
  updateProfile(profileData: Partial<User>): Observable<{ success: boolean; user: User; isPending?: boolean; message: string }> {
    return this.http.put<{ success: boolean; user: User; isPending?: boolean; message: string }>(`${this.apiUrl}/me`, profileData);
  }

  // Upload current user profile photo
  uploadProfilePicture(file: File): Observable<{ success: boolean; profilePicture: string; message: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this.http.post<{ success: boolean; profilePicture: string; message: string }>(`${this.apiUrl}/me/profile-picture`, formData);
  }

  // ==================== ADMIN OPERATIONS ====================

  // List users with search, pagination, and filter queries
  getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string;
  }): Observable<{ success: boolean; total: number; page: number; pages: number; users: User[] }> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive);

    return this.http.get<{ success: boolean; total: number; page: number; pages: number; users: User[] }>(
      this.apiUrl, 
      { params: httpParams }
    );
  }

  // Get list of pending profile update requests for Admin
  getPendingUpdates(): Observable<{ success: boolean; pendingUsers: User[] }> {
    return this.http.get<{ success: boolean; pendingUsers: User[] }>(`${this.apiUrl}/pending-updates`);
  }

  // Admin approves user profile changes
  approveProfileUpdate(id: string): Observable<{ success: boolean; user: User; message: string }> {
    return this.http.post<{ success: boolean; user: User; message: string }>(`${this.apiUrl}/${id}/approve-update`, {});
  }

  // Admin rejects user profile changes
  rejectProfileUpdate(id: string, reason?: string): Observable<{ success: boolean; user: User; message: string }> {
    return this.http.post<{ success: boolean; user: User; message: string }>(`${this.apiUrl}/${id}/reject-update`, { reason });
  }

  // Get detailed profile of any user by ID
  getUserById(id: string): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/${id}`);
  }

  // Create new user directly by Admin
  createUser(userData: Partial<User>): Observable<{ success: boolean; user: User; message: string }> {
    return this.http.post<{ success: boolean; user: User; message: string }>(this.apiUrl, userData);
  }

  // Update user profile by Admin
  updateUser(id: string, userData: Partial<User>): Observable<{ success: boolean; user: User; message: string }> {
    return this.http.put<{ success: boolean; user: User; message: string }>(`${this.apiUrl}/${id}`, userData);
  }

  // Toggle status of user account (Active vs Inactive)
  toggleActivation(id: string, isActive: boolean): Observable<{ success: boolean; isActive: boolean; message: string }> {
    return this.http.put<{ success: boolean; isActive: boolean; message: string }>(`${this.apiUrl}/${id}/activation`, { isActive });
  }

  // Reset user password by Admin
  resetPassword(id: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/reset-password`, { password });
  }

  // Soft delete a user account by Admin
  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
