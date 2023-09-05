import {Component, Input, OnInit} from '@angular/core';
import {getStateForLastUpdated} from '../state-util';
import Capacity from '../capacity';
import * as moment from 'moment';
import {BigNumber} from 'bignumber.js';
import {EnrichedStats} from '../state.service'
import {HarvesterStats} from '../api/types/satellite'

@Component({
  selector: 'app-harvester',
  templateUrl: './harvester.component.html',
  styleUrls: ['./harvester.component.scss']
})
export class HarvesterComponent implements OnInit {
  @Input() harvester: EnrichedStats<HarvesterStats>;
  @Input() bestBlockchainState: any;

  constructor() { }

  ngOnInit(): void {
  }

  get farmerConnectionsCount() {
    return this.harvester.farmerConnectionsCount !== undefined ? this.harvester.farmerConnectionsCount : this.harvester['farmerConnections'].length;
  }

  get status() {
    if (this.lastUpdatedState !== 0) {
      return 'Unknown';
    }
    if (this.farmerConnectionsCount > 0) {
      return 'Connected';
    }

    return 'Disconnected';
  }

  get colorClassForSyncStatus() {
    const status = this.status;
    if (status === 'Connected') {
      return 'color-green';
    }
    if (status === 'Unknown') {
      return 'color-orange';
    }

    return 'color-red';
  }

  get satelliteName() {
    return this.harvester.satelliteName;
  }

  get plotCount() {
    return this.harvester.plotCount;
  }

  public get formattedRawCapacity(): string {
    return new Capacity(this.rawCapacityInGib).toString();
  }

  private get rawCapacityInGib(): BigNumber {
    return new BigNumber(this.harvester.totalRawPlotCapacityInGib || this.harvester['totalCapacityInGib'])
  }

  public get formattedEffectiveCapacity(): string {
    return new Capacity(this.effectiveCapacityInGib).toString();
  }

  private get effectiveCapacityInGib(): BigNumber {
    return new BigNumber(this.harvester.totalEffectivePlotCapacityInGib || this.harvester['totalCapacityInGib'])
  }

  get lastUpdatedBefore() {
    return moment(this.harvester.lastUpdate).fromNow();
  }

  get lastUpdatedState() {
    return getStateForLastUpdated(this.harvester.lastUpdate);
  }

  get estimatedTimeToWinInHours() {
    if (!this.bestBlockchainState) {
      return 'N/A';
    }
    if (this.effectiveCapacityInGib.isZero()) {
      return 'N/A'
    }
    const networkSpace = new Capacity(this.bestBlockchainState.spaceInGib).capacityInGib;
    const capacity = this.effectiveCapacityInGib
    const chanceToWinABlock = capacity.dividedBy(networkSpace);
    const avgBlocksTillWin = new BigNumber(1).dividedBy(chanceToWinABlock);
    const blocksPerDay = new BigNumber(4608);
    const blockWinsPerDay = blocksPerDay.dividedBy(avgBlocksTillWin);
    const avgTimeToWinInMinutes = new BigNumber(24 * 60).dividedBy(blockWinsPerDay);

    return `≈ ${moment.duration(avgTimeToWinInMinutes, 'minutes').humanize()}`;
  }

  get ogPlots() {
    return this.harvester.ogPlots;
  }

  get nftPlots() {
    return this.harvester.nftPlots;
  }

  get plotCountString() {
    if (!this.ogPlots && !this.nftPlots) {
      return `${this.plotCount} Plots`;
    }
    if (this.ogPlots && this.ogPlots.count === 0) {
      return `${this.plotCount} Plots (NFT)`;
    }
    if (this.nftPlots && this.nftPlots.count === 0) {
      return `${this.plotCount} Plots (OG)`;
    }

    return `${this.plotCount} Plots (OG: ${this.ogPlots.count} | NFT: ${this.nftPlots.count})`;
  }
}
