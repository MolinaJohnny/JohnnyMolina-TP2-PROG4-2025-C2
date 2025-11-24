import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  httpClient = inject(HttpClient);
  auth = inject(Auth)

  subirPublicacion(formData: FormData) {
    return this.httpClient.post(
      `${environment.apiUrl}/publicaciones/subir`,
      formData,
      {
        withCredentials: true 
      }
    );
  }
  obtenerPublicaciones(opts?: { sort?: string; offset?: number; limit?: number }) {
    let params = new HttpParams();
    if (opts?.sort) params = params.set('sort', opts.sort);
    if (opts?.offset != null) params = params.set('offset', String(opts.offset));
    if (opts?.limit != null) params = params.set('limit', String(opts.limit));

    return this.httpClient.get(`${environment.apiUrl}/publicaciones/todas`, { params });
  }
  toggleLike(idPublcicacion: string){
    return this.httpClient.post(`${environment.apiUrl}/publicaciones/${idPublcicacion}/like`,{},
          { withCredentials: true }   
    )
  }
  //                               SECCION COMENTARIOS
  obtenerComentarios(publicacionId: string) {
    return this.httpClient.get<any[]>(`${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`,
          { withCredentials: true } 
    );
  }
  agregarComentario(publicacionId: string, contenido: string) {
    return this.httpClient.post<any>(`${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`, { contenido },
          { withCredentials: true }  
    );
  }
  eliminarComentario( nose: string,comentarioId: string) {
  return this.httpClient.delete<any>(
    `${environment.apiUrl}/publicaciones/comentarios/${comentarioId}`,
    { withCredentials: true }
  );
  }
  eliminarPublicacion(publicacionId: string) {
    return this.httpClient.delete<any>(
      `${environment.apiUrl}/publicaciones/${publicacionId}`,
      { withCredentials: true }
    );
  }
  porUsuario(usuarioId: string) {
    return this.httpClient.get<any[]>(`${environment.apiUrl}/publicaciones/porUsuario/${usuarioId}`,
          { withCredentials: true } 
    );
  }
  editarComentario(comentarioId: string, contenido: string) { 
    return this.httpClient.put<any[]>(`${environment.apiUrl}/publicaciones/comentarios/${comentarioId}`, { contenido },
          { withCredentials: true }  
    );
  } 
}
