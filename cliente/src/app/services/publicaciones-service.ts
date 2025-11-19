import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  httpClient = inject(HttpClient);


  subirPublicacion(formData: FormData) {
    return this.httpClient.post(
      `${environment.apiUrl}/publicaciones/subir`,
      formData,
      {
        withCredentials: true 
      }
    );
  }
  obtenerPublicaciones(opts?: { sort?: string; userId?: string; offset?: number; limit?: number }) {
    let params = new HttpParams();
    if (opts?.sort) params = params.set('sort', opts.sort);
    if (opts?.userId) params = params.set('userId', opts.userId);
    if (opts?.offset != null) params = params.set('offset', String(opts.offset));
    if (opts?.limit != null) params = params.set('limit', String(opts.limit));

    return this.httpClient.get(`${environment.apiUrl}/publicaciones/todas`, { params });
  }
  toggleLike(idPublcicacion: string){
    return this.httpClient.post(`${environment.apiUrl}/publicaciones/${idPublcicacion}/like`,{})
  }
  //                               SECCION COMENTARIOS
  obtenerComentarios(publicacionId: string) {
    return this.httpClient.get<any[]>(`${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`);
  }
  agregarComentario(publicacionId: string, contenido: string) {
    return this.httpClient.post<any>(`${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`, { contenido });
  }
}
