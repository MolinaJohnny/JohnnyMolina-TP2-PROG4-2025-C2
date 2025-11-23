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
  
  authState = signal<boolean>(false);
  isInitialized = signal<boolean>(false);

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
    console.log("Data cookie obtenida auth.ts:", data.resultado.usuario._id);
    return data;
  }
  register(usuario: FormData) {
    return this.httpClient.post(`${environment.apiUrl}/auth/register`, usuario);
  }
  //validar cookie
  async checkAuth() {
    try {

      const data = await this.dataCookie();

      const token = data?.resultado?.token;
      if (token) {
        localStorage.setItem('token', token);
        this.authState.set(true);
        // console.log("Esto deberia funcionar");
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
    return this.httpClient.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
    .pipe(
      tap(() => {
        this.clearToken();
      })
    );
  }
 
  refreshCookie() {
    return this.httpClient.post(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true });
  }
};

interface Usuario {
  nombreUsuario: string;
  contrasena: string;
}
  


