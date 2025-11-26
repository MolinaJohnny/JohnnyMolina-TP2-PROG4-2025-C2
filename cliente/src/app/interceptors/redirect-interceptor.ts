import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const redirectInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService); // <--- INYECTADO

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.log('Error interceptado:', err);


      if (err.status === 401 || err.status === 403) {
        router.navigate(['/login']);
        return throwError(() => err);
      }


      if (err.status === 400) {
        const errorMessage = err.error?.message || '';

        if (
          errorMessage.includes('imagen') ||
          errorMessage.includes('archivo') ||
          errorMessage.includes('publicación') ||
          errorMessage.includes('comentario') ||
          errorMessage.includes('descripción') ||
          errorMessage.includes('contenido')
        ) {
          console.log('Error en archivo/publicación/comentario, redirigiendo a publicaciones...');
          router.navigate(['/publicaciones']);
          return throwError(() => err);
        }
      }

      if (err.status === 404) {
        const url = req.url.toLowerCase();

        if (url.includes('publicaciones') || url.includes('comentarios')) {
          console.log('Publicación/comentario no encontrado, redirigiendo a publicaciones...');
          router.navigate(['/publicaciones']);
          return throwError(() => err);
        }
      }

      return throwError(() => err);
    })
  );
};
