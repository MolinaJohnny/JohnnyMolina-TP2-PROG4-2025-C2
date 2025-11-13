import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';


export const redirectInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.log(err instanceof HttpErrorResponse);
      if (err.status === 401) {
        console.log('Podría redirigir a algun lado...');
        router.navigate(['/login']); 

      }
      return throwError(() => err);
    })
  );
};