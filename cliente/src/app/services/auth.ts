import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  httpClient = inject(HttpClient);
  constructor(){
  }
  // observaable de estado de autenticación
  authState = signal<boolean>(!!localStorage.getItem('token'));

  loginCookie(usuario: Usuario) {
    return this.httpClient.post(`${environment.apiUrl}/auth/login/cookie`, usuario, {
      withCredentials: true,
    });
  }
  async dataCookie() {
    const observable = this.httpClient.get(`${environment.apiUrl}/auth/data/jwt/cookie`, {
      withCredentials: true,
    })
    const data : any = await firstValueFrom(observable)
    return data;
  }
  register(usuario: FormData) {
    const peticion = this.httpClient.post(
      `${environment.apiUrl}/auth/register`,
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
    return this.httpClient.post(`${environment.apiUrl}/auth/login`, usuario);
  }
  //validar cookie
  async checkAuth() {
    try {

      const data = await this.dataCookie();

      const token = data?.resultado?.token;
      if (token) {
        localStorage.setItem('token', token);
        this.authState.set(true);
        console.log("Esto deberia funcionar");
      } else {
        this.authState.set(false);
      }
    } catch (e) {
      console.log("El check no esta funcionando");
      this.authState.set(false);
    }
  }
  clearToken() {
    localStorage.removeItem('token');
    this.authState.set(false); 
  }

  logout() {
    // Llamar al backend para borrar la cookie y luego limpiar el estado local
    return this.httpClient.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
    .pipe(
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
  


