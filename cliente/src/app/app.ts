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
  usuarioActual : any;
  async ngOnInit() {
    setTimeout(() => {
      this.validar();
    }, 2000);
    const data = await this.auth.dataCookie();
    if (data.resultado.usuario.activo === false) {
    this.auth.clearToken();
    this.router.navigate(['/login']);
      }
    this.usuarioActual = await data.resultado.usuario.perfil;
  }

  async validar() {
    try {
      const data = await this.auth.dataCookie();

      if (data?.resultado?.token) {
        this.auth.authState.set(true);
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

    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearToken();
        this.router.navigate(['/login']);
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
