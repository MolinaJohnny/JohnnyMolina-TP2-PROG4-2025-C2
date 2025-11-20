import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('cliente');
  auth = inject(Auth);
  router = inject(Router);

  isAuthenticated = this.auth.authState;
  isInitialized = this.auth.isInitialized;
  showSplash = signal(true);

  ngOnInit() {
    setTimeout(() => {
      this.validateAndShowContent();
    }, 2000);
  }

  async validateAndShowContent() {
    try {
      const data = await this.auth.dataCookie();
      
      if (data?.resultado?.token) {
        this.auth.authState.set(true);
      } else {
        this.auth.clearToken();
      }
    } catch (error: any) {
      this.auth.clearToken();
    }
    
    // En todos los casos, ocultamos el splash y mostramos el contenido
    this.showSplash.set(false);
    this.auth.isInitialized.set(true);
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearToken();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error cerrando sesión en backend', err);
        this.auth.clearToken();
        this.auth.authState.set(false);

      }
    });
  }
}
