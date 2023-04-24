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

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public user: any;
  public satellites: any[] = [];
  public stateUpdated = new Subject();
  public bestBlockchainState: any = null;
  private updateSatellitesInterval: number|undefined
  private updateRatesInterval: any;
  public isInitialLoading: boolean = true;
  public rates = {};
  public currencies = [];
  public selectedCurrency = null;

  public wallets = [];
  public fullNodes = [];
  public harvesters = [];
  public farmers = [];
  public plotters = [];

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
      .filter(satellite => satellite.version && semverLt(satellite.version, latestSatelliteVersion));
    outdatedSatellites.forEach(satellite => {
      this.toastService.showWarningConfirmToast(
        `Satellite ${satellite.name} is running v${satellite.version}, please consider upgrading to v${latestSatelliteVersion}.`,
        'Satellite update available'
      );
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

  getBestBlockchainState() {
    return this.satellites.reduce((bestBlockchainState, satellite) => {
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
    this.user = null;
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
}
