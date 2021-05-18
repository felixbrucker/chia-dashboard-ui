import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {OAuthComponent} from "./oauth.component";

const routes: Routes = [{ path: 'callback/:identityProvider', component: OAuthComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OAuthRoutingModule { }
