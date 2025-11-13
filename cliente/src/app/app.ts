import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('cliente');
  auth = inject(Auth);
  router = inject(Router);
  isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

  constructor() {
    // Suscribirse a cambios de autenticación
    this.auth.authState.subscribe((v) => this.isAuthenticated.set(v));
    // Al iniciar la app, verificar si hay una sesión válida por cookie
    this.auth.checkAuth()
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        // Ya borró cookie en backend y token local
        this.auth.authState.next(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        console.error('Error cerrando sesión en backend', err);
        // Igual limpiar estado local
        this.auth.clearToken();
        this.auth.authState.next(false);
        this.router.navigate(['/publicaciones']);
      }
    });
  }
  filtrarPorUsuario(){}
}
