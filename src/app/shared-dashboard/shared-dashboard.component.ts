import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {StateService} from '../state.service';
import {ApiService} from '../api.service';
import { faSatellite } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-shared-dashboard',
  templateUrl: '../dashboard/dashboard.component.html',
  styleUrls: ['./shared-dashboard.component.scss']
})
export class SharedDashboardComponent implements OnInit {
  public faSatellite = faSatellite;
  public shareKey: string;

  constructor(
    private route: ActivatedRoute,
    private stateService: StateService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async (params: ParamMap) => {
      this.shareKey = params.get('shareKey');
      this.apiService.setShareKey(this.shareKey);
      await this.stateService.initShared();
    });
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
