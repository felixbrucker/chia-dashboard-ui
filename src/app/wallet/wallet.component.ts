import {Component, Input, OnInit} from '@angular/core';
import ChiaAmount from '../chia-amount';
import * as moment from 'moment';
import BigNumber from 'bignumber.js';
import {getColorClassForSyncStatus, getStateForLastUpdated} from '../state-util';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  @Input() wallet: any;
  @Input() rate: any;
  @Input() selectedCurrency: any;

  constructor() { }

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

  get wallets() {
    return this.wallet.wallets.map(wallet => {
      const spendableBalance = new ChiaAmount(wallet.balance.spendable);
      const unconfirmedBalance = new ChiaAmount(wallet.balance.unconfirmed);

      return {
        type: wallet.type,
        name: wallet.name,
        balance: {
          spendable: spendableBalance.toString(),
          pending: unconfirmedBalance.amountBN.minus(spendableBalance.amountBN).toString(),
          total: unconfirmedBalance.toString(),
        },
      };
    });
  }

  get totalBalance() {
    return this.wallets.reduce((acc, wallet) => acc.plus(wallet.balance.total), new BigNumber(0));
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
}
