import { Component, OnInit, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mi-perfil',
  imports: [],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  auth = inject(Auth);

  usuario: any = {
    nombre: '',
    foto: '',
    descripcion: ''
  };

  async ngOnInit() {
      const backendUrl = 'http://localhost:3000';  // Reemplazar según corresponda

    const userActual: any = await this.auth.dataCookie();
    console.log(userActual.resultado.usuario.urlImagen) 
    this.usuario = {
      nombre: userActual.resultado.usuario.nombreUsuario,
      foto: environment.apiUrl+userActual.resultado.usuario.urlImagen,

      descripcion: 'Desarrollador web apasionado por Angular y tecnologías modernas.'
    };
  }
}
