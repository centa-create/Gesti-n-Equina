import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    if (token) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(cloned).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            // try refresh once
            return this.auth.refreshAccessToken().pipe(
              switchMap(ok => {
                if (ok) {
                  const newToken = this.auth.getAccessToken();
                  const retryReq = req.clone({ setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {} });
                  return next.handle(retryReq);
                }
                this.auth.logout();
                return throwError(() => err);
              }),
              catchError(inner => {
                this.auth.logout();
                return throwError(() => inner);
              })
            );
          }
          return throwError(() => err);
        })
      );
    }
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return this.auth.refreshAccessToken().pipe(
            switchMap(ok => {
              if (ok) {
                const newToken = this.auth.getAccessToken();
                const retryReq = req.clone({ setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {} });
                return next.handle(retryReq);
              }
              this.auth.logout();
              return throwError(() => err);
            }),
            catchError(inner => {
              this.auth.logout();
              return throwError(() => inner);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
