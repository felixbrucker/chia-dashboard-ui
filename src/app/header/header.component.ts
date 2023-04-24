import {Component, ViewChild} from '@angular/core'
import {ApiService} from '../api.service'
import {StateService} from '../state.service'
import {AddNewSatelliteModalComponent} from '../add-new-satellite-modal/add-new-satellite-modal.component'
import {faHeart} from '@fortawesome/free-regular-svg-icons'
import {faSync} from '@fortawesome/free-solid-svg-icons'
import {AutoUpdateMode} from '../auto-update-mode'
import {LocalStorageService} from '../local-storage.service'
import * as moment from 'moment'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @ViewChild(AddNewSatelliteModalComponent) child;

  public isMenuCollapsed = true;
  public faHeart = faHeart;
  public faSync = faSync
  public autoUpdateIconClasses: string[] = []
  public nextUpdateDiffInSeconds: number|undefined
  private _autoUpdateMode: AutoUpdateMode
  private autoUpdateResetTimer: number|undefined

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private localStorageService: LocalStorageService,
  ) {
    this._autoUpdateMode = AutoUpdateMode[localStorageService.getItem('autoUpdateMode') ?? AutoUpdateMode.regular]
    this.updateNextUpdateDiffInSeconds()
    setInterval(this.updateNextUpdateDiffInSeconds.bind(this), 1000)
  }

  public get isAutoUpdateOff(): boolean {
    return this._autoUpdateMode === AutoUpdateMode.off
  }

  private updateNextUpdateDiffInSeconds() {
    if (this.stateService.nextUpdateAt === undefined) {
      this.nextUpdateDiffInSeconds = undefined

      return
    }

    this.nextUpdateDiffInSeconds = this.stateService.nextUpdateAt.diff(moment(), 'seconds')
  }

  private set autoUpdateMode(autoUpdateMode: AutoUpdateMode) {
    this._autoUpdateMode = autoUpdateMode
    this.localStorageService.setItem('autoUpdateMode', autoUpdateMode)
    switch (autoUpdateMode) {
      case AutoUpdateMode.off:
        this.autoUpdateIconClasses = []
        break
      case AutoUpdateMode.slow:
        this.autoUpdateIconClasses = ['fa-spin-slow']
        break
      case AutoUpdateMode.regular:
        this.autoUpdateIconClasses = ['fa-spin']
        break
      case AutoUpdateMode.fast:
        this.autoUpdateIconClasses = ['fa-spin-fast']
        break
    }
    if (this.autoUpdateResetTimer !== undefined) {
      clearTimeout(this.autoUpdateResetTimer)
    }
    this.autoUpdateResetTimer = setTimeout(() => {
      this.autoUpdateResetTimer = undefined
      this.autoUpdateIconClasses = []
    }, 1000)
    this.stateService.autoUpdateMode = autoUpdateMode
    this.updateNextUpdateDiffInSeconds()
  }

  get selectedCurrency() {
    return this.stateService.selectedCurrency;
  }

  get currencies() {
    return this.stateService.currencies;
  }

  setSelectedCurrency(currency) {
    this.stateService.setSelectedCurrency(currency);
  }

  toggleMenuCollapse() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onTabButtonClick() {
    this.isMenuCollapsed = true
  }

  get isAuthenticated() {
    return this.apiService.isAuthenticated;
  }

  get hasShareKey() {
    return !!this.apiService.shareKey;
  }

  async logout() {
    await this.stateService.logout();
  }

  openAddSatelliteModal() {
    this.child.openModal();
  }

  get user() {
    return this.stateService.user;
  }

  public get autoUpdateClass(): string|undefined {
    if (this._autoUpdateMode !== AutoUpdateMode.off) {
      return 'color-green'
    }
  }

  public toggleAutoUpdateMode() {
    switch (this._autoUpdateMode) {
      case AutoUpdateMode.off:
        this.autoUpdateMode = AutoUpdateMode.slow
        break
      case AutoUpdateMode.slow:
        this.autoUpdateMode = AutoUpdateMode.regular
        break
      case AutoUpdateMode.regular:
        this.autoUpdateMode = AutoUpdateMode.fast
        break
      case AutoUpdateMode.fast:
        this.autoUpdateMode = AutoUpdateMode.off
        break
    }
  }
}
