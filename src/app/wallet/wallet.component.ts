import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import BigNumber from 'bignumber.js';
import {getColorClassForSyncStatus, getStateForLastUpdated} from '../state-util';
import {isChiaWallet} from '../wallet-type'
import {faEyeSlash} from '@fortawesome/free-solid-svg-icons'
import {EnrichedStats, StateService} from '../state.service'
import {WalletStats} from '../api/types/satellite'
import {ApiService} from '../api.service'
import {DisabledWallet, User} from '../api/types/user'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  @Input() wallet: EnrichedStats<WalletStats>
  @Input() rate: any;
  @Input() selectedCurrency: any;

  public readonly faEyeSlash = faEyeSlash

  private get user(): User|undefined {
    return this.stateService.user
  }

  private get disabledWallets(): DisabledWallet[] {
    const disabledWalletsByFingerprint = this.user?.settings?.disabledWalletsByFingerprint
    if (disabledWalletsByFingerprint === undefined) {
      return []
    }

    return disabledWalletsByFingerprint[this.wallet.fingerprint] ?? []
  }

  public constructor(
    private readonly stateService: StateService,
    private readonly apiService: ApiService,
  ) { }

  ngOnInit(): void {
  }

  trackBy(index, item) {
    return item.id;
  }

  get satelliteName() {
    return this.wallet.satelliteName;
  }

  get status() {
    if (this.lastUpdatedState !== 0) {
      return 'Unknown';
    }
    if (this.isSyncing) {
      return 'Syncing';
    }
    if (this.isSynced) {
      return 'Synced';
    }

    return 'Not synced';
  }

  get colorClassForSyncStatus() {
    return getColorClassForSyncStatus(this.status);
  }

  public get wallets(): WalletInfo[] {
    const disabledWallets = this.disabledWallets

    return this.wallet.wallets
      .filter(wallet => disabledWallets.every(disabledWallet => disabledWallet.id !== wallet.id))
      .map(wallet => {
        return {
          id: wallet.id,
          type: wallet.type,
          name: wallet.name,
          balance: {
            total: wallet.balance.unconfirmed,
          },
          isChiaWallet: isChiaWallet(wallet.type),
        }
    })
  }

  private get chiaWallets() {
    return this.wallets.filter(wallet => wallet.isChiaWallet)
  }

  get totalBalance() {
    return this.chiaWallets.reduce((acc, wallet) => acc.plus(wallet.balance.total), new BigNumber(0));
  }

  get totalBalanceRounded() {
    return this.totalBalance.decimalPlaces(8).toString(10);
  }

  getRoundedBalance(balance) {
    return (new BigNumber(balance)).decimalPlaces(8).toString(10);
  }

  get totalBalanceFiat() {
    if (this.rate === null) {
      return 'N/A';
    }
    const totalBalanceFiat = this.totalBalance.multipliedBy(this.rate);

    return `≈ ${totalBalanceFiat.toFixed(2)} ${this.selectedCurrency.toUpperCase()}`;
  }

  getBalanceFiat(wallet) {
    if (this.rate === null) {
      return 'N/A';
    }
    const walletBalanceFiat = (new BigNumber(wallet.balance.total)).multipliedBy(this.rate);

    return `≈ ${walletBalanceFiat.toFixed(2)} ${this.selectedCurrency.toUpperCase()}`;
  }

  get isSynced() {
    return this.wallet.syncStatus.synced;
  }

  get isSyncing() {
    return this.wallet.syncStatus.syncing;
  }

  get syncedHeight() {
    return this.wallet.syncStatus.syncedHeight;
  }

  get lastUpdatedBefore() {
    return moment(this.wallet.lastUpdate).fromNow();
  }

  get lastUpdatedState() {
    return getStateForLastUpdated(this.wallet.lastUpdate);
  }

  public async hideWallet(wallet: WalletInfo) {
    if (this.user.settings === undefined) {
      this.user.settings = {}
    }
    if (this.user.settings.disabledWalletsByFingerprint === undefined) {
      this.user.settings.disabledWalletsByFingerprint = {}
    }
    if (this.user.settings.disabledWalletsByFingerprint[this.wallet.fingerprint] === undefined) {
      this.user.settings.disabledWalletsByFingerprint[this.wallet.fingerprint] = []
    }
    const disabledWallets = this.user.settings.disabledWalletsByFingerprint[this.wallet.fingerprint]
    disabledWallets.push({ id: wallet.id, name: wallet.name })
    await this.apiService.updateUser({ disabledWalletsByFingerprint: this.user.settings.disabledWalletsByFingerprint })
  }
}

export interface WalletInfo {
  id: number
  name: string
  type: number
  balance: {
    total: string
  }
  isChiaWallet: boolean
}
