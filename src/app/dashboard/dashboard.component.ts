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
