import { Routes } from '@angular/router';
import { Error404Component } from './error/error404/error404.component';
import { Error403Component } from './error/error403/error403.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guard/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutComponent } from './logout/logout.component';

export const routes: Routes = [

    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'logout',
        component: LogoutComponent,
        canActivate: [AuthGuard],
        data: { permission: 'login' }
    },
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard],
        data: { permission: 'login' }
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { permission: 'admin' }
    },
    {
        path: '403',
        component: Error403Component
    },
    {
        path: '404',
        component: Error404Component
    },
    {
        path: '**',
        redirectTo: '404'
    }
];
