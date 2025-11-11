import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  selectedFile: File | null = null;

  registroForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2)]),
    edad : new FormControl('', [Validators.required, Validators.min(18), Validators.max(99)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), this.passwordFuerteValidator]),

  });
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.selectedFile = file;
    console.log('Archivo seleccionado:', file);
  }
  crearCuenta() {

  }

  enviarFormulario() {
    if (this.registroForm.valid) {
      console.log(this.registroForm.value);
    } else {
      console.log('Formulario no válido');
    }
    
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
