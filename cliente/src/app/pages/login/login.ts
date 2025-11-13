import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm = new FormGroup({
    nombreUsuario: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  auth = inject(Auth);
  router = inject(Router);

  enviarFormulario() {
    if (this.loginForm.valid) {
      const { nombreUsuario, password } = this.loginForm.value;
      // Usar el endpoint cookie-based
      this.auth.loginCookie({ nombreUsuario: nombreUsuario ?? '', contrasena: password ?? '' }).subscribe({
        next: (respuesta: any) => {
          console.log('Login (cookie) respuesta:', respuesta);
          // backend debe haber seteado la cookie; indicamos authState y navegamos
          this.auth.authState.next(true);
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          console.error('Error en login cookie:', err);
          alert('Error al iniciar sesión');
          this.auth.authState.next(false);
        }
      });
    } else {
      console.log('Formulario no válido');
    }
  }

  // Métodos de prueba opcionales
  logueo() {
    this.auth.loginCookie({ nombreUsuario: 'Fionas', contrasena: 'Fiona123' }).subscribe({
      next: (resp) => {
        console.log('logueo test ok', resp);
        this.auth.authState.next(true);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        console.error('logueo test err', err);
        this.auth.authState.next(false);
      }
    });
  }
  dataCookie() {
    this.auth.dataCookie();
  }
}
