import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  imports: [],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  ngOnInit(): void {
    this.crearGrafico();
  }
  chart: any; 

  crearGrafico() {
    new Chart("miGrafico", {
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
}
