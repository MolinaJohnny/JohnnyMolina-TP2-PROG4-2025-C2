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
    this.auth.checkAuth()
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.authState.next(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        console.error('Error cerrando sesión en backend', err);
        this.auth.clearToken();
        this.auth.authState.next(false);
        this.router.navigate(['/publicaciones']);
      }
    });
  }
  filtrarPorUsuario(){}
}
