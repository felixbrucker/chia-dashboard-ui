import {Injectable} from '@angular/core'
import {ApiService} from './api.service'
import {ToastService} from './toast.service'
import {Subject} from 'rxjs'
import * as moment from 'moment'
import {Moment} from 'moment'
import {LocalStorageService} from './local-storage.service'
import {SatelliteReleasesService} from './satellite-releases.service'
import * as semverLt from 'semver/functions/lt'
import {AutoUpdateMode, getIntervalInSeconds} from './auto-update-mode'
import {take} from 'rxjs/operators'
import {User} from './api/types/user'
import {
  BlockchainState,
  FarmerStats,
  FullNodeStats,
  HarvesterStats, PlotterStats,
  Satellite,
  WalletStats
} from './api/types/satellite'
import {Rates} from './api/types/rates'

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public user?: User
  public satellites: Satellite[] = []
  public stateUpdated = new Subject();
  public bestBlockchainState: BlockchainState | null = null
  private updateSatellitesInterval: number|undefined
  private updateRatesInterval: any;
  public isInitialLoading: boolean = true;
  public rates: Rates['rates'] = {}
  public currencies: Rates['currencies'] = []
  public selectedCurrency = null;

  public wallets: EnrichedStats<WalletStats>[] = []
  public fullNodes: EnrichedStats<FullNodeStats>[] = []
  public harvesters: EnrichedStats<HarvesterStats>[] = []
  public farmers: EnrichedStats<FarmerStats>[] = []
  public plotters: EnrichedStats<PlotterStats>[] = []

  public nextUpdateAt: Moment|undefined

  private isInitialized = false;
  private isInitializing = false;
  private isShared = false

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private localStorageService: LocalStorageService,
    private satelliteReleasesService: SatelliteReleasesService
  ) {
    this.selectedCurrency = this.localStorageService.getItem('selectedCurrency');
    if (!this.selectedCurrency) {
      this.setSelectedCurrency('usd');
    }
  }

  async init() {
    if (!this.apiService.isAuthenticated || this.isInitialized || this.isInitializing) {
      return;
    }
    this.isInitializing = true;
    try {
      await this.initState();
      if (this.isInitialLoading) {
        this.satelliteReleasesService.latestVersion.subscribe(this.onNewLatestSatelliteVersion.bind(this));
        await this.satelliteReleasesService.init();
      }
    } finally {
      this.isInitialLoading = false;
    }
    if (!this.updateSatellitesInterval) {
      this.autoUpdateMode = AutoUpdateMode[this.localStorageService.getItem('autoUpdateMode') ?? AutoUpdateMode.regular]
    }
    if (!this.updateRatesInterval) {
      this.updateRatesInterval = setInterval(this.updateRates.bind(this), 5 * 60 * 1000);
    }
    this.isInitialized = true;
    this.isInitializing = false;
  }

  async initShared() {
    if (this.isInitialized || this.isInitializing) {
      return;
    }
    this.isShared = true
    this.isInitializing = true;
    try {
      await this.initSharedState();
    } finally {
      this.isInitialLoading = false;
    }
    if (!this.updateSatellitesInterval) {
      this.autoUpdateMode = AutoUpdateMode[this.localStorageService.getItem('autoUpdateMode') ?? AutoUpdateMode.regular]
    }
    if (!this.updateRatesInterval) {
      this.updateRatesInterval = setInterval(this.updateRates.bind(this), 5 * 60 * 1000);
    }
    this.isInitialized = true;
    this.isInitializing = false;
  }

  public set autoUpdateMode(autoUpdateMode: AutoUpdateMode) {
    if (this.updateSatellitesInterval !== undefined) {
      clearInterval(this.updateSatellitesInterval)
    }
    if (autoUpdateMode === AutoUpdateMode.off) {
      this.nextUpdateAt = undefined

      return
    }
    const intervalInSeconds = getIntervalInSeconds(autoUpdateMode)
    this.nextUpdateAt = moment().add(intervalInSeconds, 'seconds')
    this.updateSatellitesInterval = setInterval(() => {
      this.nextUpdateAt = moment().add(intervalInSeconds, 'seconds')
      void (this.isShared ? this.updateSharedSatellites() : this.updateSatellites())
    }, intervalInSeconds * 1000)
  }

  async initState() {
    await Promise.all([
      this.updateUser(),
      this.updateSatellites(),
      this.updateRates(),
    ]);
  }

  async initSharedState() {
    await Promise.all([
      this.updateSharedSatellites(),
      this.updateRates(),
    ]);
  }

  clear() {
    if (this.updateSatellitesInterval) {
      clearInterval(this.updateSatellitesInterval)
      this.updateSatellitesInterval = undefined
    }
    if (this.updateRatesInterval) {
      clearInterval(this.updateRatesInterval);
      this.updateRatesInterval = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
  }

  onNewLatestSatelliteVersion(latestSatelliteVersion) {
    if (!latestSatelliteVersion) {
      return;
    }
    const outdatedSatellites = this.satellites
      .filter(satellite => !satellite.hidden)
      .filter(satellite => satellite.version && semverLt(satellite.version, latestSatelliteVersion))
    if (outdatedSatellites.length === 0) {
      return
    }
    let outdatedSatellitesToNotify = outdatedSatellites
    if (this.hideDismissedUpdateNotifications) {
      outdatedSatellitesToNotify = outdatedSatellites
        .filter(satellite => !this.wasSatelliteNotificationDismissedBefore(satellite._id, latestSatelliteVersion))
    }
    outdatedSatellitesToNotify.forEach(satellite => {
      const toast = this.toastService.showWarningConfirmToast(
        `Satellite ${satellite.name} is running v${satellite.version}, please consider upgrading to v${latestSatelliteVersion}.`,
        'Satellite update available'
      )
      toast
        .onHidden
        .pipe(take(1))
        .subscribe(() => {
          if (this.hideDismissedUpdateNotifications) {
            this.markSatelliteNotificationAsDismissed(satellite._id, latestSatelliteVersion)
          }
        })
    });
  }

  async updateUser() {
    try {
      this.user = await this.apiService.getUser();
    } catch (err) {
      this.toastService.showErrorToast(`Failed to retrieve the user: ${err.message}`);

      throw err;
    }
  }

  async updateSatellites() {
    if (!this.apiService.isAuthenticated) {
      return;
    }
    try {
      this.satellites = await this.apiService.getSatellites();
      this.updateFromSatellites();
    } catch (err) {
      this.toastService.showErrorToast(`Failed to retrieve the satellites: ${err.message}`);

      throw err;
    }
    this.stateUpdated.next();
  }

  async updateSharedSatellites() {
    try {
      this.satellites = await this.apiService.getSharedSatellites();
      this.updateFromSatellites();
    } catch (err) {
      this.toastService.showErrorToast(`Failed to retrieve the satellites: ${err.message}`);

      throw err;
    }
    this.stateUpdated.next();
  }

  async updateRates() {
    const { rates, currencies } = await this.apiService.getRates();
    this.rates = rates;
    this.currencies = currencies;
  }

  private getBestBlockchainState(): BlockchainState | null {
    return this.satellites.reduce((bestBlockchainState: BlockchainState | null, satellite) => {
      if (!satellite.services
        || !satellite.services.fullNode
        || !satellite.services.fullNode.stats
        || !satellite.services.fullNode.stats.blockchainState
      ) {
        return bestBlockchainState;
      }
      if (!bestBlockchainState || satellite.services.fullNode.stats.blockchainState.syncStatus.syncedHeight > bestBlockchainState.syncStatus.syncedHeight) {
        return satellite.services.fullNode.stats.blockchainState;
      }

      return bestBlockchainState;
    }, null);
  }

  async logout() {
    this.user = undefined
    this.satellites = [];
    if (this.updateSatellitesInterval) {
      clearInterval(this.updateSatellitesInterval);
    }
    this.updateSatellitesInterval = undefined;
    await this.apiService.logout();
  }

  updateFromSatellites() {
    this.bestBlockchainState = this.getBestBlockchainState();
    this.updateStatsFromSatellites('wallets', 'wallet');
    this.updateStatsFromSatellites('fullNodes', 'fullNode');
    this.updateStatsFromSatellites('harvesters', 'harvester');
    this.updateStatsFromSatellites('farmers', 'farmer');
    this.updateStatsFromSatellites('plotters', 'plotter');
  }

  updateStatsFromSatellites(localStatsName, statsKey) {
    this[localStatsName] = this.satellites.reduce((statsCollection, satellite) => {
      if (satellite.hidden) {
        return statsCollection;
      }
      if (satellite.services && satellite.services[statsKey] && satellite.services[statsKey].stats) {
        statsCollection.push({
          ...satellite.services[statsKey].stats,
          lastUpdate: satellite.services[statsKey].lastUpdate,
          satelliteName: satellite.name,
          satelliteId: satellite._id,
          satelliteUpdatedAt: satellite.updatedAt,
        });
      }
      return statsCollection;
    }, []);
  }

  setSelectedCurrency(currency) {
    this.localStorageService.setItem('selectedCurrency', currency);
    this.selectedCurrency = currency;
  }

  getRateForSelectedCurrency() {
    if (!this.selectedCurrency || !this.rates[this.selectedCurrency]) {
      return 0;
    }

    return this.rates[this.selectedCurrency];
  }

  private get hideDismissedUpdateNotifications(): boolean {
    return JSON.parse(this.localStorageService.getItem('hideDismissedUpdateNotifications')) ?? false
  }

  private wasSatelliteNotificationDismissedBefore(satelliteId: string, version: string): boolean {
    return JSON.parse(this.localStorageService.getItem(`dismissed-update-notification/satellite/${satelliteId}/version/${version}`)) ?? false
  }

  private markSatelliteNotificationAsDismissed(satelliteId: string, version: string) {
    this.localStorageService.setItem(`dismissed-update-notification/satellite/${satelliteId}/version/${version}`, JSON.stringify(true))
  }
}

export type EnrichedStats<T> = T & {
  lastUpdate: string
  satelliteName: string
  satelliteId: string
  satelliteUpdatedAt: string
}
