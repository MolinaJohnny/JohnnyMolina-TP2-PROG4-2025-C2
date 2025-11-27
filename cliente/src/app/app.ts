import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgIf, CommonModule } from '@angular/common';
import { Auth } from './services/auth';
import { SessionService } from './services/session.service';

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
  session = inject(SessionService);

  isAuthenticated = this.auth.authState;
  isInitialized = this.auth.isInitialized;
  
  showSplash = signal(true);
  usuarioActual: any = signal<string | null>(null);
  async ngOnInit() {
    setTimeout(() => {
      this.validar();
    }, 2000);
  }

  async validar() {
    try {
      const data = await this.auth.dataCookie();
      if (data?.resultado?.token) {
        this.auth.authState.set(true);
        this.usuarioActual = data.resultado.usuario.perfil;
      } else {
        this.auth.clearToken();
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.auth.clearToken();
      this.router.navigate(['/login']);

    }
    
    this.showSplash.set(false);
    this.auth.isInitialized.set(true);
  }

  logout() {
    this.router.navigate(['/login']);

    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearToken();
        window.location.reload();

      },
      error: (err) => {
        console.error('Error cerrando sesión en backend', err);
        this.auth.clearToken();
        this.auth.authState.set(false);

      }
    });

  }
}
