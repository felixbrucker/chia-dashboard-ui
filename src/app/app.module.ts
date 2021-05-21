import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import {NgxEchartsModule} from 'ngx-echarts';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ToastrModule } from 'ngx-toastr';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgxScrollTopModule } from 'ngx-scrolltop';
import {WINDOW_PROVIDERS} from "./window.provider";
import { EmptyStateComponent } from './empty-state/empty-state.component';
import {LoginComponent} from './login/login.component';
import {LoadingStateModule} from './loading-state/loading-state.module';
import {AddNewSatelliteModalComponent} from './add-new-satellite-modal/add-new-satellite-modal.component';
import { SatelliteListComponent } from './satellite-list/satellite-list.component';
import { SatelliteComponent } from './satellite/satellite.component';
import { WalletComponent } from './wallet/wallet.component';
import { FullNodeComponent } from './full-node/full-node.component';
import { HarvesterComponent } from './harvester/harvester.component';
import { FarmSummaryComponent } from './farm-summary/farm-summary.component';
import { WalletSummaryComponent } from './wallet-summary/wallet-summary.component';
import { DownloadLinksComponent } from './download-links/download-links.component';
import { FarmerComponent } from './farmer/farmer.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { PlotterComponent } from './plotter/plotter.component';
import { EditableModule } from '@ngneat/edit-in-place';
import {ClipboardModule} from 'ngx-clipboard';
import { ProfileComponent } from './profile/profile.component';
import { SharedDashboardComponent } from './shared-dashboard/shared-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    EmptyStateComponent,
    LoginComponent,
    AddNewSatelliteModalComponent,
    SatelliteListComponent,
    SatelliteComponent,
    WalletComponent,
    FullNodeComponent,
    HarvesterComponent,
    FarmSummaryComponent,
    WalletSummaryComponent,
    DownloadLinksComponent,
    FarmerComponent,
    ConfirmationModalComponent,
    PlotterComponent,
    ProfileComponent,
    SharedDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    LoadingStateModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgbModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      newestOnTop: false,
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    }),
    NgxScrollTopModule,
    EditableModule,
    ReactiveFormsModule,
    ClipboardModule,
  ],
  providers: [
    WINDOW_PROVIDERS,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
