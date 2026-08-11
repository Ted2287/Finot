import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // If 401 Unauthorized is returned, attempt to refresh token, except on login/refresh calls
      if (
        error instanceof HttpErrorResponse && 
        error.status === 401 && 
        !req.url.includes('/api/auth/refresh-token') && 
        !req.url.includes('/api/auth/login')
      ) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.token;
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
