import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  httpClient = inject(HttpClient);
  constructor(){
    this.checkAuth();
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
    console.log(observable)
    const data : any = await firstValueFrom(observable)
    console.log(data)
    return data;
  }
  register(usuario: any) {
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

      if (data?.token) {
        localStorage.setItem('token', data.token);
        this.authState.set(true);
        console.log("Esto deberia funcionar")
      } else {
        this.authState.set(false);
      }
    } catch (e) {
      console.log("Esto no esta funcionando")
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
  


