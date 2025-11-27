import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const redirectInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      //  VALIDACIONES DE LOGIN
      if (err.status === 401) {
        const msg = err.error?.message;

        if (msg === 'Contraseña incorrecta' || msg === 'Usuario no encontrado') {
          toastr.error('La contraseña o el usuario son erroneos', '401');
          return throwError(() => err);
        }

        if (msg === 'Tu cuenta está dada de baja') {
          localStorage.removeItem('token');
          toastr.error('Tu cuenta está dada de baja', '401');
          router.navigate(['/login']);
          return throwError(() => err);
        }
      }


      //  Si es 401 o 403 (y no es error de login), redirige a login
      if (err.status === 401 || err.status === 403) {
        router.navigate(['/login']);
        return throwError(() => err);
      }


      // Error 400 en archivos / publicaciones / comentarios
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
          console.log(
            'Error en archivo/publicación/comentario, redirigiendo a publicaciones...'
          );
          router.navigate(['/publicaciones']);
          return throwError(() => err);
        }
      }


      //  Error 404 en publicaciones o comentarios
      if (err.status === 404) {
        const url = req.url.toLowerCase();

        if (url.includes('publicaciones') || url.includes('comentarios')) {
          console.log(
            'Publicación/comentario no encontrado, redirigiendo a publicaciones...'
          );
          router.navigate(['/publicaciones']);
          return throwError(() => err);
        }
      }

      return throwError(() => err);
    })
  );
};
