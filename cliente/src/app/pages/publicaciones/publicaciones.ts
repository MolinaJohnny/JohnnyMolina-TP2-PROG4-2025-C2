import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {  PublicacionesService } from '../../services/publicaciones-service';
import { Auth } from '../../services/auth'
@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  
  
  // Form para crear una nueva publicacion

  postForm = new FormGroup({
    titulo: new FormControl('', [Validators.required]),
    contenido: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });


  publicacionesService = inject(PublicacionesService);
  authService = inject(Auth)
  route = inject(ActivatedRoute);

  // Lista de publicaciones (se llenará con cargarPublicaciones)
  publicaciones: any[] = [];

  // Objeto para manejar filtros
  filtros = {
    sort: 'date',
    userId: '',
    offset: 0,
    limit: 10,
  };

  constructor() {}

  ngOnInit(): void {
    // Leer query params del router (ej: userId desde la barra de búsqueda del header)
    this.route.queryParams.subscribe((params) => {
      if (params['userId']) {
        this.filtros.userId = params['userId'];
      }
      this.cargarPublicaciones();
    });
  }

  cargarPublicaciones() {
    // Construir objeto de opciones para enviar al servicio
    const opts: any = {
      sort: this.filtros.sort,
      offset: this.filtros.offset,
      limit: this.filtros.limit,
    };

    if (this.filtros.userId && this.filtros.userId.trim()) {
      opts.userId = this.filtros.userId;
    }

    this.publicacionesService.obtenerPublicaciones(opts).subscribe({
      next: (datos: any) => {
        this.publicaciones = Array.isArray(datos) ? datos : datos?.data ?? [];
        console.log('Publicaciones cargadas:', this.publicaciones);
      },
      error: (err) => {
        console.error('Error cargando publicaciones:', err);
        this.publicaciones = [];
      }
    });
  }

  aplicarFiltros() {
    this.filtros.offset = 0;
    this.cargarPublicaciones();
  }

  resetearFiltros() {
    this.filtros.sort = 'date';
    this.filtros.userId = '';
    this.filtros.offset = 0;
    this.filtros.limit = 20;
    this.cargarPublicaciones();
  }

  async enviarPublicacion() {
    if (this.postForm.valid) {
      const usuario = await this.authService.dataCookie()
      const form = this.postForm.value;
      const publicacion = {
        titulo: form.titulo ?? '',
        descripcion: form.contenido ?? '',
        usuario: usuario.user,
        
      }
      this.publicacionesService.subirPublicacion(publicacion)
      // limpiar el formulario
      this.postForm.reset();
      // Recargar publicaciones después de enviar
      this.cargarPublicaciones();
    } else {
      console.log('Formulario de publicación inválido');
    }
  }

  eliminarPublicacion(id: string) {
    // TODO: implementar eliminación
    console.log('eliminarPublicacion', id);
  }

  editarPublicacion(pub: any) {
    // TODO: implementar edición
    console.log('editarPublicacion', pub);
  }

  // Ir a la página anterior
  paginaAnterior() {
    if (this.filtros.offset > 0) {
      this.filtros.offset -= this.filtros.limit;
      this.cargarPublicaciones();
    }
  }

  // Ir a la página siguiente
  paginaSiguiente() {
    if (this.publicaciones.length === this.filtros.limit) {
      this.filtros.offset += this.filtros.limit;
      this.cargarPublicaciones();
    }
  }
}

