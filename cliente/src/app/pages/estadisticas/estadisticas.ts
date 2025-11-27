import { Component, inject, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../services/admin.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  constructor() {}
  adminService = inject(AdminService);

  ngOnInit(): void {
    this.traerPublicaciones();  
  }

  tiempo = 5;
  datos = {};
  chart: any;

  crearGrafico(labels: string[], values: number[]) {
    if (this.chart) {
      this.chart.destroy(); 
    }

    this.chart = new Chart("miGrafico", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de publicaciones',
          data: values,
          borderWidth: 1,
          backgroundColor: ['red', 'blue', 'green', 'yellow']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
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
    this.adminService.traerPublicaciones(this.tiempo).subscribe({
      next: (resp: any) => {
        this.datos = resp || [];
        console.log("Publicaciones recibidas:", resp);
        const dataProcesada = this.ordenarPub(resp);

        const labels = dataProcesada.map(x => x.usuario);
        const values = dataProcesada.map(x => x.cantidad);

        this.crearGrafico(labels, values);
      },
      error: (err: any) => {
        console.error('Error al traer publicaciones', err);
      },
    });
  }
  ordenarPub(publicaciones: any[]) {
    const contador: Record<string, number> = {};
    const ahora = new Date();

    publicaciones.forEach(pub => {
      const usuario = pub.usuario || "Desconocido";
      const fechaPub = new Date(pub.fechaCreacion);
      const diffDias = (ahora.getTime() - fechaPub.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDias <= this.tiempo) {
        contador[usuario] = (contador[usuario] || 0) + 1;
      }
    });

    return Object.keys(contador).map(usuario => ({
      usuario,
      cantidad: contador[usuario]
    }));
  }
  traercommentarios() {
  }
}
