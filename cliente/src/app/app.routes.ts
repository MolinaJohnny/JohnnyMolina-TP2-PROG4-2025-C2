import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'publicaciones',
        loadComponent: () => import('./pages/publicaciones/publicaciones').then(m => m.Publicaciones)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro').then(m => m.Registro)
    },
    {
        path: 'mi-perfil',
        loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfil)
    },
    {
        path: 'estadisticas',
        loadComponent: () => import('./pages/estadisticas/estadisticas').then(m => m.Estadisticas)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
    }

];
