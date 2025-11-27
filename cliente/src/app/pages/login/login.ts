import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { ToastrService } from 'ngx-toastr';
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
  constructor(private toastr: ToastrService) {}
  auth = inject(Auth);
  router = inject(Router);
  session = inject(SessionService);

  async enviarFormulario() {
    if (this.loginForm.valid) {
      const { nombreUsuario, password } = this.loginForm.value;
      this.auth.loginCookie({ nombreUsuario: nombreUsuario ?? '', contrasena: password ?? '' }).subscribe({
        next: (respuesta: any) => {
          this.auth.usuarioActual.set(respuesta.resultado.usuario.perfil);
          console.log('Login (cookie) respuesta:', respuesta);
          this.auth.authState.set(true);

          this.session.start(10);
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => {
          this.auth.authState.set(false);
        }
      });
    } else {
      console.log('Formulario no válido');
    }
  }

  logueo() {
    this.auth.loginCookie({ nombreUsuario: 'Fionas', contrasena: 'Fiona123' }).subscribe({
      next: (resp : any) => {
        console.log('logueo test ok', resp);
        this.auth.usuarioActual.set(resp.resultado.usuario.perfil);

        this.auth.authState.set(true);
        
        this.session.start(10);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        console.error('logueo test err', err);
        this.toastr.error('Error en el inicio de sesión de prueba', 'Error');
        this.auth.authState.set(false);
      }
    });
  }
  dataCookie() {
    this.auth.dataCookie();
  }
}
