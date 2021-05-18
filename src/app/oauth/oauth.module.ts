import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {OAuthComponent} from "./oauth.component";
import {OAuthRoutingModule} from "./oauth-routing.module";
import {NgbDropdownModule} from "@ng-bootstrap/ng-bootstrap";
import {LoadingStateModule} from '../loading-state/loading-state.module';

@NgModule({
  declarations: [OAuthComponent],
  imports: [
    CommonModule,
    OAuthRoutingModule,
    NgbDropdownModule,
    LoadingStateModule,
  ],
})
export class OAuthModule { }
