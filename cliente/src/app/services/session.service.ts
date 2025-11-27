import { Injectable, inject, signal } from '@angular/core';
import { Auth } from './auth';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SessionService {
  auth = inject(Auth);
  toastr = inject(ToastrService);
  router = inject(Router);

  showWarning = signal<boolean>(false);

  private warningTimer: any = null;
  private expiryTimer: any = null;
  private durationMinutes = 10;
  
  // modificar minutes para que avise 3 minutos antes

  start(minutes: number) {
    this.stop();
    this.durationMinutes = minutes;
    // modificar para que avise 3 minutos antes
    const warningMs = Math.max(0, (minutes - 4)) * 60 * 1000; 
    const expiryMs = minutes * 60 * 1000;

    // Si minutes=10, warningMs = 5min
    this.warningTimer = setTimeout(() => this.promptExtend(), warningMs);
    this.expiryTimer = setTimeout(() => this.onExpiry(), expiryMs);
  }

  stop() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    this.showWarning.set(false);
  }

  promptExtend() {
    this.showWarning.set(true);
  }

  acceptExtend() {
    this.showWarning.set(false);
    this.auth.refreshCookie().subscribe({
      next: (res: any) => {
        this.toastr.success('Sesión extendida', 'Éxito');
        // Reiniciar timers
        this.start(this.durationMinutes);
      },
      error: (err) => {
        console.error('Error al refrescar token:', err);
        this.toastr.error('No se pudo extender la sesión', 'Error');
      }
    });
  }

  declineExtend() {
    this.showWarning.set(false);
    this.toastr.info('No se extenderá la sesión. Expirará en 5 minutos.', 'Aviso');
  }

  private onExpiry() {
    this.auth.clearToken();
    //enviar a login
    this.router.navigate(['/login']);

    this.toastr.warning('Tu sesión ha expirado', 'Sesión');
  }
}
