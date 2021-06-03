import {Component, Input, OnInit} from '@angular/core';
import BigNumber from 'bignumber.js';
import * as moment from 'moment';
import Capacity from '../capacity';
import {getStateForLastUpdated} from '../state-util';

const BLOCKS_PER_DAY = 4608;
const BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365;

@Component({
  selector: 'app-farm-summary',
  templateUrl: './farm-summary.component.html',
  styleUrls: ['./farm-summary.component.scss']
})
export class FarmSummaryComponent implements OnInit {
  @Input() harvesters: any;
  @Input() fullNodes: any;
  @Input() wallets: any;
  @Input() farmers: any;
  @Input() bestBlockchainState: any;
  @Input() rate: any;
  @Input() selectedCurrency: any;

  constructor() { }

  ngOnInit(): void {
  }

  farmerHasRecentFarmingInfos(farmer) {
    if (farmer.farmingInfos.length === 0) {
      return false;
    }

    return moment().diff(moment(farmer.farmingInfos[0].lastUpdated), 'minutes') < 2;
  }

  isFullNodeSynced(fullNode) {
    return fullNode.blockchainState.syncStatus.synced;
  }

  get status() {
    if (this.farmers.length === 0 && this.fullNodes.length === 0 && this.harvesters.length === 0) {
      return 'N/A';
    }
    const farmersLastUpdateStates = this.getLastUpdatedState(this.farmers);
    const fullNodesLastUpdateStates = this.getLastUpdatedState(this.fullNodes);
    const harvestersLastUpdateStates = this.getLastUpdatedState(this.harvesters);
    const allFarmersRecentlyUpdated = farmersLastUpdateStates.every(state => state === 0);
    const allFullNodesRecentlyUpdated = fullNodesLastUpdateStates.every(state => state === 0);
    const allHarvestersRecentlyUpdated = harvestersLastUpdateStates.every(state => state === 0);
    if (!allFarmersRecentlyUpdated || !allFullNodesRecentlyUpdated || !allHarvestersRecentlyUpdated) {
      return 'Unknown';
    }
    const farmerWithRecentFarmingInfo = this.farmers.map(farmer => this.farmerHasRecentFarmingInfos(farmer));
    const connectedHarvesters = this.harvesters.map(harvester => (harvester.farmerConnectionsCount !== undefined ? harvester.farmerConnectionsCount : harvester.farmerConnections.length) > 0);
    const fullNodesSynced = this.fullNodes.map(fullNode => this.isFullNodeSynced(fullNode));
    const allFarmerWithRecentFarmingInfo = farmerWithRecentFarmingInfo.every(hasRecentFarmingInfo => !!hasRecentFarmingInfo);
    const allConnectedHarvesters = connectedHarvesters.every(isConnected => !!isConnected);
    const allFullNodesSynced = fullNodesSynced.every(isSynced => !!isSynced);
    if (allFullNodesSynced && allFarmerWithRecentFarmingInfo && allConnectedHarvesters) {
      return 'Operational';
    }
    const allFarmerWithoutRecentFarmingInfo = farmerWithRecentFarmingInfo.every(hasRecentFarmingInfo => !hasRecentFarmingInfo);
    const allDisconnectedHarvesters = connectedHarvesters.every(isConnected => !isConnected);
    const allFullNodesNotSynced = fullNodesSynced.every(isSynced => !isSynced);
    if (allFullNodesNotSynced && allFarmerWithoutRecentFarmingInfo && allDisconnectedHarvesters) {
      return 'Problem';
    }

    return 'Degraded';
  }

  getLastUpdatedState(services) {
    return services.map(service => getStateForLastUpdated(service.lastUpdate));
  }

  get formattedCapacity() {
    return new Capacity(this.capacityInGib).toString();
  }

  get capacityInGib() {
    return this.harvesters.reduce((acc, harvester) => acc.plus(harvester.totalCapacityInGib), new BigNumber(0));
  }

  get plotCount() {
    return this.harvesters.reduce((acc, harvester) => acc.plus(harvester.plotCount), new BigNumber(0)).toNumber();
  }

  get networkSpace() {
    if (!this.bestBlockchainState) {
      return 'N/A';
    }
    return new Capacity(this.bestBlockchainState.spaceInGib).toString();
  }

  get colorClassForSyncStatus() {
    const status = this.status;
    if (status === 'N/A') {
      return '';
    }
    if (status === 'Operational') {
      return 'color-green';
    }
    if (status === 'Degraded' || status === 'Unknown') {
      return 'color-orange';
    }
    return 'color-red';
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
    const blocksPerDay = new BigNumber(BLOCKS_PER_DAY);
    const blockWinsPerDay = blocksPerDay.dividedBy(avgBlocksTillWin);
    const avgTimeToWinInMinutes = new BigNumber(24 * 60).dividedBy(blockWinsPerDay);

    return `≈ ${moment.duration(avgTimeToWinInMinutes, 'minutes').humanize()}`;
  }

  get dailyRewardXch() {
    const dailyReward = this.dailyRewardXcBighNumber;
    if (dailyReward == null) {
      return 'N/A';
    }

    return `≈ ${dailyReward.toFixed(2)} XCH`;
  }

  get dailyRewardXcBighNumber() {
    if (!this.bestBlockchainState || this.capacityInGib.isZero()) {
      return null;
    }
    const networkSpace = new Capacity(this.bestBlockchainState.spaceInGib).capacityInGib;
    const capacity = this.capacityInGib;
    const chanceToWinABlock = capacity.dividedBy(networkSpace);
    const avgBlocksTillWin = new BigNumber(1).dividedBy(chanceToWinABlock);
    const blocksPerDay = new BigNumber(BLOCKS_PER_DAY);
    const blockWinsPerDay = blocksPerDay.dividedBy(avgBlocksTillWin);

    return blockWinsPerDay.multipliedBy(this.getRewardForHeight(this.bestBlockchainState.syncStatus.syncedHeight));
  }

  get dailyRewardFiat() {
    if (this.rate === null) {
      return 'N/A';
    }
    const dailyRewardXch = this.dailyRewardXcBighNumber;
    if (dailyRewardXch == null) {
      return 'N/A';
    }
    const dailyReward = dailyRewardXch.multipliedBy(this.rate);

    return `≈ ${dailyReward.toFixed(2)} ${this.selectedCurrency.toUpperCase()}`;
  }

  getRewardForHeight(height) {
    if (height === null) {
      return 0;
    }

    if (height < 3 * BLOCKS_PER_YEAR) {
      return 2;
    } else if (height < 6 * BLOCKS_PER_YEAR) {
      return 1;
    } else if (height < 9 * BLOCKS_PER_YEAR) {
      return 0.5;
    } else if (height < 12 * BLOCKS_PER_YEAR) {
      return 0.25;
    }

    return 0.125;
  }

  get lastHeightFarmedDuration() {
    const lastHeight = this.lastHeightFarmedOrNull;
    if (!lastHeight) {
      return 'N/A';
    }
    const blockDiff = this.bestBlockchainState.syncStatus.syncedHeight - lastHeight;
    const duration = moment.duration(this.getBlockCountAsSeconds(blockDiff), 'seconds').humanize();

    return `${duration} ago`;
  }

  get lastHeightFarmedOrNull() {
    return this.wallets.reduce((bestHeight, wallet) => {
      const lastHeightFarmed = wallet.farmedAmount.lastHeightFarmed;
      if (bestHeight === null) {
        return lastHeightFarmed;
      }

      return bestHeight > lastHeightFarmed ? bestHeight : lastHeightFarmed;
    }, null);
  }

  getBlockCountAsSeconds(blockCount) {
    return new BigNumber(1).dividedBy(new BigNumber(BLOCKS_PER_DAY).dividedBy(24).dividedBy(60).dividedBy(60)).multipliedBy(blockCount).toNumber();
  }
}
