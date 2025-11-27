import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";


@Injectable({
    providedIn: 'root',
})
export class AdminService {
    httpClient = inject(HttpClient);

    crearUsuario(formData: FormData) {
        return this.httpClient.post(`${environment.apiUrl}/usuarios/crear-admin`, formData, {
            withCredentials: true,
        });
    }
    traerUsuarios() {
        return this.httpClient.get(`${environment.apiUrl}/usuarios`, {
            withCredentials: true,
            });
    }
    cambiarAlta(usuarioId: string) {
        return this.httpClient.post(`${environment.apiUrl}/usuarios/${usuarioId}/estado`, {  }, {
            withCredentials: true,
        });
    }
    cambiarBaja(usuarioId: string) {
        return this.httpClient.delete(`${environment.apiUrl}/usuarios/${usuarioId}`,{
            withCredentials: true,
        }); 
    }
    traerPublicaciones(dias?: number) {
    return this.httpClient.get(`${environment.apiUrl}/usuarios/pub`, {
        withCredentials: true,
        params: dias ? { dias: dias } : {}
    });
    }

    traerComentarios(dias?: number) {
    return this.httpClient.get(`${environment.apiUrl}/usuarios/comentarios`, {
        withCredentials: true,
        params: dias ? { dias: dias } : {}
    });
    }
}