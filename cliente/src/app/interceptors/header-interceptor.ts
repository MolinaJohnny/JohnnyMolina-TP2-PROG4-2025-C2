import { HttpInterceptorFn } from '@angular/common/http';
import { ConstantPool } from '@angular/compiler';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(req.url);
  
  const nuevaRequest = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token')),
    credentials: 'include',
  });
  return next(nuevaRequest);
};
