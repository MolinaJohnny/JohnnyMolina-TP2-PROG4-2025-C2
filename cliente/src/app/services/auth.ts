import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  httpClient = inject(HttpClient);
  apiUrl = 'http://localhost:3000';
  // observaable de estado de autenticación
  authState = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));

  loginCookie(usuario: Usuario) {
    return this.httpClient.post(this.apiUrl + '/auth/login/cookie', usuario, {
      withCredentials: true,
    });
  }
  async dataCookie() {
    const observable = this.httpClient.get(this.apiUrl + '/auth/data/jwt/cookie', {
      withCredentials: true,
    })
    const data : any = await firstValueFrom(observable)
    console.log(data)
    return data;
  }
  register(usuario: any) {
    const peticion = this.httpClient.post(
      this.apiUrl + '/auth/register',
      usuario,
      {
        // credentials: 'include',
      }
    );
    
    peticion.subscribe((respuesta) => {
      console.log('Registro exitoso:', respuesta);
    }, (error) => {
      console.error('Error en el registro:', error);
    });
  }

  login(usuario: Usuario) {
    return this.httpClient.post(this.apiUrl + '/auth/login', usuario);
  }
  //validar cookie
  checkAuth() {
    return this.dataCookie();
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.authState.next(true);
  }

  clearToken() {
    localStorage.removeItem('token');
    this.authState.next(false);
  }

  logout() {
    // Llamar al backend para borrar la cookie y luego limpiar el estado local
    return this.httpClient.post(this.apiUrl + '/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearToken();
      })
    );
  }
};

interface Usuario {
  nombreUsuario: string;
  contrasena: string;
}
  


