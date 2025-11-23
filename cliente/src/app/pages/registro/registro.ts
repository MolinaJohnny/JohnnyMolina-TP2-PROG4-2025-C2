import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';
import { SessionService } from '../../services/session.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  selectedFile: File | null = null;
  imagenUrl: string = '';
  constructor(private toastr: ToastrService){}

  registroForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2)]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    nombreUsuario: new FormControl('', [Validators.required, Validators.minLength(3)]),
    contrasena: new FormControl('', [Validators.required, Validators.minLength(8), this.passwordFuerteValidator]),
    fechaNacimiento: new FormControl('', [Validators.required]),
    descripcion: new FormControl(''),
    imagenUrl: new FormControl(''),
    perfil: new FormControl('usuario'),
  });
  router = inject(Router);

  auth = inject(Auth);
  session = inject(SessionService);
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    console.log("Imagen seleccionada:", file);
  }

  crearCuenta() {
  if (this.registroForm.valid && this.selectedFile) {

    const formData = new FormData();

    formData.append('nombre', this.registroForm.value.nombre || '');
    formData.append('apellido', this.registroForm.value.apellido || '');
    formData.append('correo', this.registroForm.value.correo || '');
    formData.append('nombreUsuario', this.registroForm.value.nombreUsuario || '');
    formData.append('contrasena', this.registroForm.value.contrasena || '');
    formData.append('fechaNacimiento', this.registroForm.value.fechaNacimiento || '');
    formData.append('descripcion', this.registroForm.value.descripcion || '');
    formData.append('perfil', this.registroForm.value.perfil || 'usuario');

    formData.append('imagenUrl', this.selectedFile);

    this.auth.register(formData).subscribe({
      next: (resp: any) => {
        console.log('Registro exitoso', resp);
        this.toastr.success('Registro exitoso', 'Éxito');
        this.router.navigate(['/login']);

      },
      error: (err) => {
        console.error('Error interno', err);

        if(err.error["message"] == "El nombre de usuario ya existe"){
          this.toastr.error(err.error["message"], "404");
        }
        if(err.error["message"] == "El correo electrónico ya está registrado"){
        this.toastr.error(err.error["message"], "404");}
        else{
          this.toastr.error("Error en el servidor", "500");
        }
      }
    });
  } else {
        this.toastr.error("Completa todos los campos correctamente", "404");
  }
}

  enviarFormulario() {
    this.crearCuenta();
  }
  validarEmail(control: AbstractControl) : ValidationErrors | null {
    const error = {iguales : false};

    if (control.value === null){
      return error;
    }
    const email = control.parent?.get('email')?.value;

    if(!email){
      return error;
    }
    
    if (control.value === email){
      return null; 
    } else {
      return error;
    }
  }
  passwordFuerteValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const tieneMayuscula = /[A-Z]/.test(value);
  const tieneNumero = /\d/.test(value);

  if (!tieneMayuscula || !tieneNumero) {
    return { passwordFuerte: true };
  }
  return null;
}
}
