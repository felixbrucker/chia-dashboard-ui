import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {LoadingStateComponent} from './loading-state.component';

@NgModule({
  declarations: [LoadingStateComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    LoadingStateComponent,
  ],
})
export class LoadingStateModule {}
