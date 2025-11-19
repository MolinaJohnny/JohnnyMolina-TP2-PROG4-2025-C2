import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones-service';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule, NgClass],
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
  nuevoComentario: string = '';

  filtros = {
    sort: 'date',
    userId: '',
    offset: 0,
    limit: 10,
  };
  modalAbierto = false;
  publicacionSeleccionada: any = null;
  rutaImagen: string = "";
  abrirModal(pub: any) {
    this.publicacionSeleccionada = pub;
    this.modalAbierto = true;
    this.rutaImagen = environment.apiUrl+this.publicacionSeleccionada.urlImagen
    console.log(this.publicacionSeleccionada.urlImagen)
    this.publicacionesService.obtenerComentarios(pub._id).subscribe({
      next: (comentarios: any[]) => {
        this.publicacionSeleccionada.comentarios = comentarios;
      },
      error: (err) => console.error("Error cargando comentarios:", err)
    });
  }

  cerrarModal(event?: Event) {
    if (event) event.stopPropagation();
    this.modalAbierto = false;
    this.publicacionSeleccionada = null;
  }
  agregarComentario() {
    if (!this.nuevoComentario.trim()) return;

    this.publicacionesService
      .agregarComentario(this.publicacionSeleccionada._id, this.nuevoComentario)
      .subscribe({
        next: (comentario: any) => {
          if (!this.publicacionSeleccionada.comentarios) {
            this.publicacionSeleccionada.comentarios = [];
          }
          this.publicacionSeleccionada.comentarios.unshift(comentario);
          this.nuevoComentario = '';
        },
        error: (err) => console.error("Error agregando comentario:", err)
      });
  }

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
    likes = 0;
  likeado = false;

  async likear(pub: any) {
    const usuario = await this.authService.dataCookie();
    const nombreUsuario = usuario.resultado['usuario'].nombreUsuario;

    this.publicacionesService.toggleLike(pub._id).subscribe({
      next: (res: any) => {
        // actualiza el numero de likes
        pub.likesCantidad = res.likes;

        // marca si ya está likeado
        pub.likeado = res.likeado;

        // si querés actualizar el array completo de likes:
        if (res.likeado) {
          pub.likes.push(nombreUsuario);
        } else {
          pub.likes = pub.likes.filter((id: string) => id !== nombreUsuario);
        }
      },
      error: (err) => console.error("Error al dar like:", err)
    });
  }
}