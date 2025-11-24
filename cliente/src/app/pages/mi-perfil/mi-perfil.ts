import { Component, OnInit, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';
import { PublicacionesService } from '../../services/publicaciones-service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-mi-perfil',
  imports: [NgIf, NgFor],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  auth = inject(Auth);
  publicacionesService = inject(PublicacionesService);
  publicaciones: any[] = [];
  usuario: any = {
    nombre: '',
    foto: '',
    descripcion: ''
  };
  environment = environment;

  async ngOnInit() {

    const userActual: any = await this.auth.dataCookie();
    this.cargarPublicaciones();
    console.log(userActual.resultado.usuario.urlImagen) 
    this.usuario = {
      nombre: userActual.resultado.usuario.nombreUsuario,
      foto: environment.apiUrl+userActual.resultado.usuario.urlImagen,

      descripcion: 'Desarrollador web apasionado por Angular y tecnologías modernas.'
      
    };
    
  }
  async cargarPublicaciones() {
    const userActual: any = await this.auth.dataCookie();
    this.publicacionesService.porUsuario(userActual.resultado.usuario._id|| '').subscribe((data) => {
      this.publicaciones = data;
      console.log(this.publicaciones)
    });
  }
}