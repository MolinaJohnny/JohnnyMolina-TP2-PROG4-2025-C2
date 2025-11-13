import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  httpClient = inject(HttpClient);
  apiUrl = 'http://localhost:3000';


  subirPublicacion(publicacion: any) {
    const peticion = this.httpClient.post(
      this.apiUrl + '/publicaciones/subir',
      publicacion, {
      // credentials: 'include',
      }
    );
    peticion.subscribe((respuesta) => {
      console.log('Publicacion subida: ', respuesta);
      }, (error) => {
        console.error('Error en el front al subir: ', error)
      })
  }
  register(usuario: any) {
    console.log('Enviando registro con datos:', usuario);
    const peticion = this.httpClient.post(
      this.apiUrl + '/auth/register',
      usuario,
      {
        // credentials: 'include',
      }
    );
    
    peticion.subscribe((respuesta) => {
      console.log('Registro exitoso:', respuesta);
    }, (error) => {
      console.error('Error en el registro:', error);
    });
  }
  obtenerPublicaciones(opts?: { sort?: string; userId?: string; offset?: number; limit?: number }) {
    let params = new HttpParams();
    if (opts?.sort) params = params.set('sort', opts.sort);
    if (opts?.userId) params = params.set('userId', opts.userId);
    if (opts?.offset != null) params = params.set('offset', String(opts.offset));
    if (opts?.limit != null) params = params.set('limit', String(opts.limit));

    return this.httpClient.get(this.apiUrl + '/publicaciones/todas', { params });
  }
}
