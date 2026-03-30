import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/pages/register/register.component';
import { LoginComponent } from './auth/pages/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MesFichiersComponent } from './fichiers/pages/mes-fichiers/mes-fichiers.component';
import { PartagesAvecMoiComponent } from './fichiers/pages/partages-avec-moi/partages-avec-moi.component';
import { ProfilComponent } from './profil/profil.component';
import { ActivitesComponent } from './activites/activites.component';
import { PartagePublicComponent } from './partage-public/partage-public.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'partage/:token', component: PartagePublicComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'fichiers', component: MesFichiersComponent },
      { path: 'partages', component: PartagesAvecMoiComponent },
      { path: 'profil', component: ProfilComponent },
      { path: 'activites', component: ActivitesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
