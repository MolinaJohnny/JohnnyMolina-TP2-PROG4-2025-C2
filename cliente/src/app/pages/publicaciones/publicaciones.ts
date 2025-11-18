import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones-service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {

  postForm = new FormGroup({
    titulo: new FormControl('', [Validators.required]),
    contenido: new FormControl('', [Validators.required, Validators.minLength(1)]),
  });

  publicacionesService = inject(PublicacionesService);
  authService = inject(Auth);
  route = inject(ActivatedRoute);

  publicaciones: any[] = [];
  imagenSeleccionada: File | null = null;

  filtros = {
    sort: 'date',
    userId: '',
    offset: 0,
    limit: 10,
  };

  constructor() {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['userId']) {
        this.filtros.userId = params['userId'];
      }
      this.cargarPublicaciones();
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.imagenSeleccionada = file;
    console.log("Imagen seleccionada:", file);
  }

  cargarPublicaciones() {
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
      },
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
    if (this.postForm.invalid) {
      console.log('Formulario inválido');
      return;
    }

    if (!this.imagenSeleccionada) {
      console.log('Debes seleccionar una imagen');
      return;
    }

    const usuario = await this.authService.dataCookie();
    const form = this.postForm.value;

    const formData = new FormData();
    formData.append('titulo', form.titulo ?? '');
    formData.append('descripcion', form.contenido ?? '');
    formData.append('usuario', usuario.resultado['usuario'].nombreUsuario);
    formData.append('urlImagen', this.imagenSeleccionada); 

    this.publicacionesService.subirPublicacion(formData).subscribe({
      next: () => {
        console.log('Publicación subida con éxito');

        // Reset form y file
        this.postForm.reset();
        this.imagenSeleccionada = null;

        // Recargar publicaciones
        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al subir publicación:', err);
      },
    });
  }

  paginaAnterior() {
    if (this.filtros.offset > 0) {
      this.filtros.offset -= this.filtros.limit;
      this.cargarPublicaciones();
    }
  }

  paginaSiguiente() {
    if (this.publicaciones.length === this.filtros.limit) {
      this.filtros.offset += this.filtros.limit;
      this.cargarPublicaciones();
    }
  }
}