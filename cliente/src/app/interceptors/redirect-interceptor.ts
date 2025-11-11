import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const redirectInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.log(err instanceof HttpErrorResponse);
      if (err.status === 401) {
        console.log('Podría redirigir a algun lado...');
      }
      return throwError(() => err);
    })
  );
};