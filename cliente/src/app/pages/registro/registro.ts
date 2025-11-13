import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  selectedFile: File | null = null;
  imagenUrl: string = '';

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

  auth = inject(Auth);
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.selectedFile = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenUrl = e.target.result;
        this.registroForm.patchValue({ imagenUrl: this.imagenUrl });
      };
      reader.readAsDataURL(file);
    }
  }

  crearCuenta() {
    if (this.registroForm.valid) {
      const form = this.registroForm.value;
      

      
      const usuario = {
        nombre: form.nombre ?? '',
        apellido: form.apellido ?? '',
        correo: form.correo ?? '',
        nombreUsuario: form.nombreUsuario ?? '',
        contrasena: form.contrasena ?? '',
        fechaNacimiento: form.fechaNacimiento ?? '',
        descripcion: form.descripcion ?? '',
        imagenUrl: this.imagenUrl ?? "",
        perfil: form.perfil ?? 'usuario',
      };
      
      console.log('Datos a enviar:', usuario);
      this.auth.register(usuario);
    } else {
      if (!this.selectedFile || !this.imagenUrl) {
        alert('Por favor, selecciona una imagen de perfil');
      } else {
        console.log('Formulario no válido');
      }
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
