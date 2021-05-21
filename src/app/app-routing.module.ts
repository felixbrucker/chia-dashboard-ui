import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {SatelliteListComponent} from './satellite-list/satellite-list.component';
import {ProfileComponent} from './profile/profile.component';
import {SharedDashboardComponent} from './shared-dashboard/shared-dashboard.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent, pathMatch: 'full', data: { titleSuffix: 'Login' } },
  { path: 'satellites', component: SatelliteListComponent, pathMatch: 'full', data: { titleSuffix: 'Satellites' } },
  { path: 'profile', component: ProfileComponent, pathMatch: 'full', data: { titleSuffix: 'Profile' } },
  { path: 'shared/:shareKey', component: SharedDashboardComponent, pathMatch: 'full' },
  { path: 'oauth', loadChildren: () => import('./oauth/oauth.module').then(m => m.OAuthModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
