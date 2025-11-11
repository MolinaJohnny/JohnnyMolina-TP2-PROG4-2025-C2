import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  auth = inject(Auth);

  enviarFormulario() {
    if (this.loginForm.valid) {
    } else {
      console.log('Formulario no válido');
    }
  }
  logueo() {
    this.auth.loginCookie({ nombreUsuario: 'Fionas', contrasena: 'Fiona123' });
  }

  loginTest() {
    this.auth.login({ nombreUsuario: 'agus', contrasena: '123' });
  }
  data() {
    this.auth.data();
  }
  dataCookie() {
    this.auth.dataCookie();
  }
}
