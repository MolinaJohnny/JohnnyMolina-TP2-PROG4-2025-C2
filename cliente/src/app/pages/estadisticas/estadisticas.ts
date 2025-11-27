import { Component, inject, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../services/admin.service';
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  constructor() {}
  adminService = inject(AdminService);

  ngOnInit(): void {
    this.crearGrafico();
    this.traerPublicaciones();

  }
  datos = {};
  chart: any; 

  crearGrafico() {
    this.chart = new Chart("miGrafico", {
      type: 'bar',
      data: {
        labels: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
        datasets: [{
          label: 'Cantidad',
          data: [12, 19, 3, 5],
          borderWidth: 1,
          backgroundColor: ['red','blue','green','yellow']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  actualizarDatos(nuevosValores: number[]) {
    this.chart.data.datasets[0].data = nuevosValores;
    this.chart.update();
  }
  // traerUsuarios() {
  //   this.adminService.traerUsuarios().subscribe({
  //     next: (resp: any) => {
  //       this.datos = resp || [];
  //     },
  //     error: (err: any) => {
  //       console.error('Error al traer usuarios', err);
  //     },
  //   });
  // }
  traerPublicaciones() {
    this.adminService.traerPublicaciones().subscribe({
      next: (resp: any) => {
        this.datos = resp || [];
        console.log(this.datos);
      },
      error: (err: any) => {
        console.error('Error al traer publicaciones', err);
      },
    });
  }
  ordenarPub(publicaciones: any[]) {
    const contador: Record<string, number> = {};

    publicaciones.forEach(pub => {
      const usuario = pub.usuario;

      if (!contador[usuario]) {
        contador[usuario] = 1;
      } else {
        contador[usuario]++;
      }
    });

    // Convertir a array
    return Object.keys(contador).map(usuario => ({
      usuario,
      cantidad: contador[usuario]
    }));
  }
  traercommentarios() {
  }
  ordenarDatos(datos: [] , criterio: string) {
    const retorno = [];
    switch (criterio) {
      case 'comentario':
        
      case 'publicacion':
        for(let u of datos){
          retorno.push(u);}
        break;
      default:
        console.warn('Criterio de ordenamiento no reconocido');
    }
    return datos;
  }
}
