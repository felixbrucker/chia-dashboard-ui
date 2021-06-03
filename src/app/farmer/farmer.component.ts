import { Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {getStateForLastUpdated} from '../state-util';
import {EChartsOption} from 'echarts';
import {StateService} from '../state.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  styleUrls: ['./farmer.component.scss']
})
export class FarmerComponent implements OnInit {
  @Input() farmer: any;
  public chartOptions: EChartsOption;
  public chartUpdateOptions: EChartsOption;

  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.chartOptions = {
      grid: {
        left: 20,
        top: 5,
        right: 1,
        bottom: 20,
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'time',
        minInterval: 60 * 1000,
      },
      yAxis: {
        type: 'value',
      },
      series: [{
        data: this.passedFilter,
        type: 'line',
        name: 'Passed Filter',
        smooth: true
      }, {
        data: this.proofs,
        type: 'line',
        name: 'Proofs',
        smooth: true
      }],
    };
    this.stateService.stateUpdated.subscribe(() => {
      this.chartUpdateOptions = {
        series: [{
          data: this.passedFilter,
        }, {
          data: this.proofs,
        }],
      };
    });
  }

  get averageHarvesterResponseTime() {
    if (this.farmer.averageHarvesterResponseTime !== undefined) {
      return this.farmer.averageHarvesterResponseTime;
    }
    if (!this.farmer.harvesterResponseTimes || this.farmer.harvesterResponseTimes.length === 0) {
      return null;
    }

    return this.farmer.harvesterResponseTimes
      .reduce((acc, curr) => acc.plus(curr), new BigNumber(0))
      .dividedBy(this.farmer.harvesterResponseTimes.length)
      .toNumber();
  }

  get averageHarvesterResponseTimeFormatted() {
    const averageHarvesterResponseTime = this.averageHarvesterResponseTime;
    if (averageHarvesterResponseTime === null) {
      return 'N/A';
    }

    return `${averageHarvesterResponseTime.toFixed(0)} ms`;
  }

  get worstHarvesterResponseTime() {
    if (this.farmer.worstHarvesterResponseTime !== undefined) {
      return this.farmer.worstHarvesterResponseTime;
    }
    if (!this.farmer.harvesterResponseTimes || this.farmer.harvesterResponseTimes.length === 0) {
      return null;
    }

    return this.farmer.harvesterResponseTimes
      .reduce((acc, curr) => acc.isGreaterThan(curr) ? acc : new BigNumber(curr), new BigNumber(0))
      .toNumber();
  }

  get worstHarvesterResponseTimeFormatted() {
    const worstHarvesterResponseTime = this.worstHarvesterResponseTime;
    if (worstHarvesterResponseTime === null) {
      return 'N/A';
    }

    return `${worstHarvesterResponseTime.toFixed(0)} ms`;
  }

  getColorClassForResponseTime(responseTimeMs) {
    if (responseTimeMs === null) {
      return '';
    }
    if (responseTimeMs >= 5000) {
      return 'color-red';
    }
    if (responseTimeMs >= 2500) {
      return 'color-orange';
    }

    return 'color-green';
  }

  get passedFilter() {
    return this.farmer.farmingInfos.map(farmingInfo => [farmingInfo.receivedAt, farmingInfo.passedFilter]);
  }

  get proofs() {
    return this.farmer.farmingInfos.map(farmingInfo => [farmingInfo.receivedAt, farmingInfo.proofs]);
  }

  get farmerHasRecentFarmingInfos() {
    if (this.farmer.farmingInfos.length === 0) {
      return false;
    }
    const wasRecentlyUpdated = moment().diff(this.farmer.lastUpdate, 'minutes') < 2;
    if (!wasRecentlyUpdated) {
      return null;
    }

    return moment().diff(moment(this.farmer.farmingInfos[0].lastUpdated), 'minutes') < 2;
  }

  get status() {
    if (this.lastUpdatedState !== 0) {
      return 'Unknown';
    }
    const hasRecentFarmingInfos = this.farmerHasRecentFarmingInfos;
    if (hasRecentFarmingInfos) {
      return 'Farming';
    }

    return 'Not farming';
  }

  get colorClassForSyncStatus() {
    const status = this.status;
    if (status === 'Farming') {
      return 'color-green';
    }
    if (status === 'Unknown') {
      return 'color-orange';
    }

    return 'color-red';
  }

  get satelliteName() {
    return this.farmer.satelliteName;
  }

  get lastUpdatedBefore() {
    return moment(this.farmer.lastUpdate).fromNow();
  }

  get lastUpdatedState() {
    return getStateForLastUpdated(this.farmer.lastUpdate);
  }
}
