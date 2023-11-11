import {Component, Input, OnInit} from '@angular/core';
import {BigNumber} from 'bignumber.js';
import * as moment from 'moment';
import {getStateForLastUpdated} from '../state-util';
import {isChiaWallet} from '../wallet-type'
import {Wallet, WalletStats} from '../api/types/satellite'
import {EnrichedStats, StateService} from '../state.service'
import {DisabledWallet, User} from '../api/types/user'

@Component({
  selector: 'app-wallet-summary',
  templateUrl: './wallet-summary.component.html',
  styleUrls: ['./wallet-summary.component.scss']
})
export class WalletSummaryComponent implements OnInit {
  @Input() wallets: EnrichedStats<WalletStats>[]
  @Input() bestBlockchainState: any;
  @Input() rate: any;
  @Input() selectedCurrency: any;

  private get user(): User|undefined {
    return this.stateService.user
  }

  private get enabledChiaWallets(): Wallet[] {
    return this.uniqueWallets.reduce(
      (acc: Wallet[], curr) => {
        const disabledWallets = this.getDisabledWalletsForFingerprint(curr.fingerprint)

        return acc.concat(
          (curr.wallets ?? []).filter(wallet =>
            isChiaWallet(wallet.type)
            && disabledWallets.every(disabledWallet => disabledWallet.id !== wallet.id)
          )
        )
      },
      []
    )
  }

  public constructor(
    private readonly stateService: StateService,
  ) { }

  ngOnInit(): void {
  }

  private getDisabledWalletsForFingerprint(fingerprint: number): DisabledWallet[] {
    const disabledWalletsByFingerprint = this.user?.settings?.disabledWalletsByFingerprint
    if (disabledWalletsByFingerprint === undefined) {
      return []
    }

    return disabledWalletsByFingerprint[fingerprint] ?? []
  }

  public get walletCount(): number {
    return this.enabledChiaWallets.length
  }

  private get totalBalance(): BigNumber {
    return this.enabledChiaWallets.reduce((acc, wallet) => acc.plus(wallet.balance.unconfirmed), new BigNumber(0))
  }

  get totalBalanceFormatted() {
    return this.totalBalance.toString(10);
  }

  private get uniqueWallets(): EnrichedStats<WalletStats>[] {
    const legacyWallets = [];
    const uniqueWalletsByFingerprint: Record<number, EnrichedStats<WalletStats>> = this.wallets.reduce((walletsByFingerprint, wallet) => {
      if (!wallet.fingerprint) {
        legacyWallets.push(wallet);

        return walletsByFingerprint;
      }
      if (!walletsByFingerprint[wallet.fingerprint] || moment(walletsByFingerprint[wallet.fingerprint].lastUpdate).isBefore(wallet.lastUpdate)) {
        walletsByFingerprint[wallet.fingerprint] = wallet;
      }

      return walletsByFingerprint;
    }, {});

    return Object.values(uniqueWalletsByFingerprint).concat(legacyWallets);
  }

  get totalBalanceFiat() {
    if (this.rate === null) {
      return 'N/A';
    }
    const totalBalanceFiat = this.totalBalance.multipliedBy(this.rate);

    return `≈ ${totalBalanceFiat.toFixed(2)} ${this.selectedCurrency.toUpperCase()}`;
  }

  isWalletSynced(wallet) {
    return wallet.syncStatus.synced;
  }

  get status() {
    if (this.wallets.length === 0 && this.wallets.length === 0) {
      return 'N/A';
    }
    const walletsLastUpdateStates = this.getLastUpdatedState(this.wallets);
    const allWalletsRecentlyUpdated = walletsLastUpdateStates.every(state => state === 0);
    if (!allWalletsRecentlyUpdated) {
      return 'Unknown';
    }
    const walletsSynced = this.wallets.map(wallet => this.isWalletSynced(wallet));
    const allWalletsSynced = walletsSynced.every(isSynced => !!isSynced);
    if (allWalletsSynced) {
      return 'Operational';
    }
    const allWalletsNotSynced = walletsSynced.every(isSynced => !isSynced);
    if (allWalletsNotSynced) {
      return 'Problem';
    }

    return 'Degraded';
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

  getLastUpdatedState(services) {
    return services.map(service => getStateForLastUpdated(service.lastUpdate));
  }
}
