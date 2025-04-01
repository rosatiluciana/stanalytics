import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { TerminiECondizioniComponent } from './pages/termini-econdizioni/termini-econdizioni.component';

export const routes: Routes = [
    
    { path: 'login', component: LoginComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'user-dashboard', component: UserDashboardComponent },
    { path: 'termini', component: TerminiECondizioniComponent },
    
    // Rotte non trovate
    { path: '',  redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];