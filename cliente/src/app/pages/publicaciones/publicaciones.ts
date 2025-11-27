import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from '../../services/publicaciones-service';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';
import { from, map, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, NgFor, NgIf, FormsModule, NgClass, AsyncPipe],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  constructor(private toastr: ToastrService){}

  environment = environment;

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
  comentarioEditando: string | null = null;
  contenidoEditando: string = "";
  filtros = {
    sort: 'date',
    offset: 0,
    limit: 4,
  };
  modalAbierto = false;
  publicacionSeleccionada: any = null;
  rutaImagen: string = "";
  comentarios$!: Observable<any[]>;
  usuarioActual: any;
  usuarioPerfil: string = '';
  usuarioID: string = '';
  async ngOnInit() {
    this.cargarPublicaciones();
    this.usuarioActual = await this.authService.dataCookie();
    this.usuarioPerfil = this.usuarioActual.resultado.usuario.perfil;
    this.usuarioID = this.usuarioActual.resultado.usuario._id;
  }

  //             PUBLICACIONES
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.imagenSeleccionada = file;
    console.log("Imagen seleccionada:", file);
  }
  async enviarPublicacion() {
    if (this.postForm.invalid) {
      console.log('Formulario inválido');
      return;
    }
    
    const usuario = await this.authService.dataCookie();
    const form = this.postForm.value;
    
    const formData = new FormData();
    formData.append('titulo', form.titulo ?? '');
    formData.append('descripcion', form.contenido ?? '');
    formData.append('usuario', usuario.resultado['usuario'].nombreUsuario);
    formData.append('usuarioId', usuario.resultado['usuario']._id);
    
    if (this.imagenSeleccionada) {
      formData.append('urlImagen', this.imagenSeleccionada);
    }
    
    this.publicacionesService.subirPublicacion(formData).subscribe({
      next: () => {
        console.log('Publicación subida con éxito');
        
        this.postForm.reset();
        this.imagenSeleccionada = null;
        
        this.cargarPublicaciones();
      },
      error: (err) => {
        console.error('Error al subir publicación:', err);
      },
    });
  }
  cargarPublicaciones() {
    const limit = typeof this.filtros.limit === 'string' 
      ? parseInt(this.filtros.limit, 10) 
      : this.filtros.limit;
    const offset = typeof this.filtros.offset === 'string' 
      ? parseInt(this.filtros.offset, 10) 
      : this.filtros.offset;

    const opts: any = {
      sort: this.filtros.sort || 'date',
      offset: offset,
      limit: limit,
    };


    this.publicacionesService.obtenerPublicaciones(opts).subscribe({
      next: (datos: any) => {
        const lista = Array.isArray(datos) ? datos : datos?.data ?? [];
        lista.sort((a: any, b: any) => {
          const fa = a?.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
          const fb = b?.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
          return fb - fa; // descendente: más reciente primero
        });
        this.publicaciones = lista;
      },
      error: (err) => {
        console.error('Error cargando publicaciones:', err);
        this.publicaciones = [];
      },
    });
  }
  eliminarPublicacion(publicacionId: string) {
    this.publicacionesService
      .eliminarPublicacion(publicacionId)
      .subscribe({
        next: () => {
          this.toastr.success('Publicación eliminada correctamente', 'Éxito');
          if (this.publicaciones && this.publicaciones.length > 0) {
            this.publicaciones = this.publicaciones.filter(
              (pub: any) => pub._id !== publicacionId
            );
          }

          this.publicacionSeleccionada = null;
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error eliminando publicación:', err);
          this.toastr.error('No puedes eliminar esta publicación', '401');
        }
      });
  }
  abrirModal(pub: any) {
    this.publicacionSeleccionada = pub;
    this.modalAbierto = true;
    this.rutaImagen = environment.apiUrl + pub.urlImagen;

    this.comentarios$ = this.publicacionesService.obtenerComentarios(pub._id);
  }

  cerrarModal(event?: Event) {
    if (event) event.stopPropagation();
    this.modalAbierto = false;
    this.publicacionSeleccionada = null;
  }
  async likear(pub: any) {
    const usuario = await this.authService.dataCookie();
    const nombreUsuario = usuario.resultado['usuario'].nombreUsuario;

    this.publicacionesService.toggleLike(pub._id).subscribe({
      next: (res: any) => {

        if (res.likeado) {
          pub.likes.push(nombreUsuario);
        } else {
          pub.likes = pub.likes.filter((id: string) => id !== nombreUsuario);
        }
      },
      error: (err) => console.error("Error al dar like:", err)
    });
  }

      //           COMENTARIOS

  agregarComentario() {
    if (!this.nuevoComentario.trim()) return;

    this.publicacionesService
      .agregarComentario(this.publicacionSeleccionada._id, this.nuevoComentario)
      .subscribe({
        next: () => {
          this.toastr.info('Comentario agregado', 'Info');

          this.comentarios$ = this.publicacionesService.obtenerComentarios(this.publicacionSeleccionada._id);

          this.nuevoComentario = '';
        },
        error: (err) => {
          console.error("Error agregando comentario:", err);
          this.toastr.error("No se pudo agregar el comentario", "Error");
        }
      });
  }
  eliminarComentario(publicacionId: string, comentarioId: string) {
    this.publicacionesService
      .eliminarComentario(publicacionId, comentarioId)
      .subscribe({
        next: () => {
          this.comentarios$ = this.publicacionesService.obtenerComentarios(publicacionId);

          this.toastr.success('Comentario eliminado correctamente', 'Éxito');
        },
        error: (err) => {
          console.error("Error eliminando comentario:", err);
          this.toastr.error("No puedes eliminar este comentario", "Error");
        }
      });
  }
  activarEdicion(comentario: any) {
    this.comentarioEditando = comentario._id;
    this.contenidoEditando = comentario.contenido;
  }
  confirmarEdicion(comentario: any) {
    if (!this.contenidoEditando.trim()) return;

    this.publicacionesService
      .editarComentario(comentario._id, this.contenidoEditando)
      .subscribe({
        next: () => {
          this.comentarios$ = this.publicacionesService.obtenerComentarios(
            this.publicacionSeleccionada._id
          );
          this.cancelarEdicion(); // salir del modo edición
        },
        error: (err) => console.error("Error al editar comentario:", err),
      });
  }
  cancelarEdicion() {
    this.comentarioEditando = null;
    this.contenidoEditando = "";
  }
  //          FILTROS
  aplicarFiltros() {
    if (typeof this.filtros.limit === 'string') {
      this.filtros.limit = parseInt(this.filtros.limit, 10);
    }
    this.filtros.offset = 0;
    this.cargarPublicaciones();
  }

  resetearFiltros() {
    this.filtros.sort = 'date';
    this.filtros.offset = 0;
    this.filtros.limit = 4;
    this.cargarPublicaciones();
  }
  
  
  
  
  //          PAGINACION
  paginaSiguiente() {
    if (this.publicaciones.length === this.filtros.limit) {
      this.filtros.offset += this.filtros.limit;
      this.cargarPublicaciones();
    }
  }
  likes = 0;
  likeado = false;
  paginaAnterior() {
    if (this.filtros.offset > 0) {
      this.filtros.offset -= this.filtros.limit;
      this.cargarPublicaciones();
    }
  }

}