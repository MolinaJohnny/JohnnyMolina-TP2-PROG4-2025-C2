import { Component, inject, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../../environments/environment';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, ReactiveFormsModule, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  adminService = inject(AdminService);
  auth = inject(Auth);
  router = inject(Router);

  

  selectedFile: File | null = null;
  listadoUsuarios: any[] = [];
  environment = environment;
  modalAbierto = false;
  constructor( private toastr: ToastrService ) {}
  async ngOnInit() {
    await this.traerUsuarios();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    console.log("Imagen seleccionada:", file);
  }
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


  async enviarFormulario() {
    if (this.registroForm.invalid) {
      this.toastr.error("Completa todos los campos correctamente", "Error");
      return;
    }

    const formData = new FormData();

    formData.append('nombre', this.registroForm.value.nombre || '');
    formData.append('apellido', this.registroForm.value.apellido || '');
    formData.append('correo', this.registroForm.value.correo || '');
    formData.append('nombreUsuario', this.registroForm.value.nombreUsuario || '');
    formData.append('contrasena', this.registroForm.value.contrasena || '');
    formData.append('fechaNacimiento', this.registroForm.value.fechaNacimiento || '');
    formData.append('descripcion', this.registroForm.value.descripcion || '');
    formData.append('perfil', this.registroForm.value.perfil || '');

    if (this.selectedFile) {
      formData.append('imagenUrl', this.selectedFile);
    }

    this.adminService.crearUsuario(formData).subscribe({
      next: (resp: any) => {
        this.toastr.success("Usuario creado correctamente", "Éxito");

        this.cerrarModal();
        this.registroForm.reset({
          perfil: 'usuario'
        });

        this.selectedFile = null;
        this.traerUsuarios();
      },

      error: (err) => {
        console.error(err);

        if (err.error?.message === "El nombre de usuario ya existe") {
          this.toastr.error("El nombre de usuario ya existe", "Error");
        } 
        else if (err.error?.message === "El correo electrónico ya está registrado") {
          this.toastr.error("El correo electrónico ya está registrado", "Error");
        }
        else {
          this.toastr.error("Error en el servidor", "Error");
        }
      }
    });
  }



  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  traerUsuarios() {
    this.adminService.traerUsuarios().subscribe({
      next: (resp: any) => {
        this.listadoUsuarios = resp || [];
      },
      error: (err: any) => {
        console.error('Error al traer usuarios', err);
      },
    });
  }

  bajaAlta(usuarioId: string, estadoActual: boolean) {
    if (estadoActual == false ) {
    this.adminService.cambiarAlta(usuarioId).subscribe({
      next: (resp: any) => {
        this.toastr.success('Estado del usuario dado de alta', 'Éxito');
        this.traerUsuarios();
      },
      error: (err: any) => {
        console.error('Error al cambiar estado del usuario', err);
      },
    });
    } else {
      this.adminService.cambiarBaja(usuarioId).subscribe({
        next: (resp: any) => {
          this.toastr.success('Estado del usuario dado de baja', 'Éxito');
          this.traerUsuarios();
        },
        error: (err: any) => {
          console.error('Error al cambiar estado del usuario', err);
        },
      });
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
