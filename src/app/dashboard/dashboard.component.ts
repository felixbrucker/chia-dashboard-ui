import {Component, OnInit} from '@angular/core';
import {ApiService} from '../api.service';
import {Router} from '@angular/router';
import {StateService} from '../state.service';
import { faSatellite } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public faSatellite = faSatellite;
  public shareKey: string = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private stateService: StateService,
  ) {}

  async ngOnInit() {
    if (!this.apiService.isAuthenticated) {
      await this.router.navigate(['/login']);
      return;
    }
    await this.stateService.init();
  }

  trackBy(index, item) {
    return item.satelliteId;
  }

  get rate() {
    return this.stateService.getRateForSelectedCurrency();
  }

  get selectedCurrency() {
    return this.stateService.selectedCurrency;
  }

  get isInitialLoading() {
    return this.stateService.isInitialLoading;
  }

  get bestBlockchainState() {
    return this.stateService.bestBlockchainState;
  }

  get satellites() {
    return this.stateService.satellites;
  }

  get wallets() {
    return this.stateService.wallets;
  }

  public get hasWallets(): boolean {
    return this.wallets.length > 0
  }

  public get farmSummaryClasses(): string {
    if (this.hasWallets) {
      return 'col-md-6 col-lg-8 col-xl-8 col-xxxl-18'
    }

    return 'col-md-12 col-lg-12 col-xl-12 col-xxxl-24'
  }

  get fullNodes() {
    return this.stateService.fullNodes;
  }

  get harvesters() {
    return this.stateService.harvesters;
  }

  get farmers() {
    return this.stateService.farmers;
  }

  get plotters() {
    return this.stateService.plotters;
  }
}
