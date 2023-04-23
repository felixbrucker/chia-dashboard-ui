import { Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {getStateForLastUpdated} from '../state-util';
import {EChartsOption} from 'echarts';
import {StateService} from '../state.service';
import BigNumber from 'bignumber.js';
import {LocalStorageService} from '../local-storage.service'
import {faEllipsisV} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  styleUrls: ['./farmer.component.scss']
})
export class FarmerComponent implements OnInit {
  @Input() farmer: any;

  public readonly faEllipsisV = faEllipsisV
  public chartOptions: EChartsOption;
  public chartUpdateOptions: EChartsOption;

  public constructor(
    private stateService: StateService,
    private localStorageService: LocalStorageService,
  ) {}

  private get isShowingResponseTimeInMs(): boolean {
    return JSON.parse(this.localStorageService.getItem('isShowingResponseTimeInMs')) ?? true
  }

  private set isShowingResponseTimeInMs(isShowingResponseTimeInMs: boolean) {
    this.localStorageService.setItem('isShowingResponseTimeInMs', JSON.stringify(isShowingResponseTimeInMs))
  }

  public toggleIsShowingResponseTimeInMs() {
    this.isShowingResponseTimeInMs = !this.isShowingResponseTimeInMs
  }

  ngOnInit(): void {
    this.chartOptions = {
      grid: {
        left: 22,
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
    if (this.isShowingResponseTimeInMs) {
      return `${averageHarvesterResponseTime.toFixed(0)} ms`
    }

    return `${(averageHarvesterResponseTime / 1000).toFixed(1)} sec`
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
    if (this.isShowingResponseTimeInMs) {
      return `${worstHarvesterResponseTime.toFixed(0)} ms`
    }

    return `${(worstHarvesterResponseTime / 1000).toFixed(1)} sec`
  }

  getColorClassForResponseTime(responseTimeMs) {
    if (responseTimeMs === null) {
      return ''
    }
    switch (this.responseTimeColorScheme) {
      case ResponseTimeColorScheme.strict:
        if (responseTimeMs >= 5000) {
          return 'color-red'
        }
        if (responseTimeMs >= 2500) {
          return 'color-orange'
        }

        return 'color-green'
      case ResponseTimeColorScheme.regular:
        if (responseTimeMs >= 10000) {
          return 'color-red'
        }
        if (responseTimeMs >= 5000) {
          return 'color-orange'
        }

        return 'color-green'
      case ResponseTimeColorScheme.relaxed:
        if (responseTimeMs >= 20000) {
          return 'color-red'
        }
        if (responseTimeMs >= 10000) {
          return 'color-orange'
        }

        return 'color-green'
    }
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

  public get responseTimeColorScheme(): ResponseTimeColorScheme {
    if (this.farmer === undefined) {
      return ResponseTimeColorScheme.strict
    }

    return ResponseTimeColorScheme[this.localStorageService.getItem(`${this.farmer.satelliteId}/responseTimeColorScheme`) ?? ResponseTimeColorScheme.strict]
  }

  public set responseTimeColorScheme(responseTimeColorScheme: ResponseTimeColorScheme) {
    if (this.farmer === undefined) {
      return
    }

    this.localStorageService.setItem(`${this.farmer.satelliteId}/responseTimeColorScheme`, responseTimeColorScheme)
  }

  protected readonly ResponseTimeColorScheme = ResponseTimeColorScheme
}

enum ResponseTimeColorScheme {
  strict = 'strict',
  regular = 'regular',
  relaxed = 'relaxed',
}
