import {Component, Input, OnInit} from '@angular/core';
import {getStateForLastUpdated} from '../state-util';
import Capacity from '../capacity';
import * as moment from 'moment';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-harvester',
  templateUrl: './harvester.component.html',
  styleUrls: ['./harvester.component.scss']
})
export class HarvesterComponent implements OnInit {
  @Input() harvester: any;
  @Input() bestBlockchainState: any;

  constructor() { }

  ngOnInit(): void {
  }

  get farmerConnectionsCount() {
    return this.harvester.farmerConnectionsCount !== undefined ? this.harvester.farmerConnectionsCount : this.harvester.farmerConnections.length;
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

  get capacity() {
    return new Capacity(this.capacityInGib).toString();
  }

  get capacityInGib() {
    return new BigNumber(this.harvester.totalCapacityInGib);
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
    if (this.capacityInGib.isZero()) {
      return 'N/A';
    }
    const networkSpace = new Capacity(this.bestBlockchainState.spaceInGib).capacityInGib;
    const capacity = this.capacityInGib;
    const chanceToWinABlock = capacity.dividedBy(networkSpace);
    const avgBlocksTillWin = new BigNumber(1).dividedBy(chanceToWinABlock);
    const blocksPerDay = new BigNumber(4608);
    const blockWinsPerDay = blocksPerDay.dividedBy(avgBlocksTillWin);
    const avgTimeToWinInMinutes = new BigNumber(24 * 60).dividedBy(blockWinsPerDay);

    return `≈ ${moment.duration(avgTimeToWinInMinutes, 'minutes').humanize()}`;
  }
}
