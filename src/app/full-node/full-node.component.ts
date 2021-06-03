import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';
import {getColorClassForSyncStatus, getStateForLastUpdated} from '../state-util';
import Capacity from '../capacity';

@Component({
  selector: 'app-full-node',
  templateUrl: './full-node.component.html',
  styleUrls: ['./full-node.component.scss']
})
export class FullNodeComponent implements OnInit {
  @Input() fullNode: any;

  constructor() { }

  ngOnInit(): void {
  }

  get fullNodeConnectionCount() {
    return this.fullNode.fullNodeConnectionsCount !== undefined ? this.fullNode.fullNodeConnectionsCount : this.fullNode.fullNodeConnections.length;
  }

  get satelliteName() {
    return this.fullNode.satelliteName;
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

  get colorClassForConnectionCount() {
    if (this.fullNodeConnectionCount === 0) {
      return 'color-red';
    }
    if (this.fullNodeConnectionCount < 3) {
      return 'color-orange';
    }
    return '';
  }

  get networkSpace() {
    return new Capacity(this.fullNode.blockchainState.spaceInGib).toString();
  }

  get difficulty() {
    return this.fullNode.blockchainState.difficulty;
  }

  get isSynced() {
    return this.fullNode.blockchainState.syncStatus.synced;
  }

  get isSyncing() {
    return this.fullNode.blockchainState.syncStatus.syncing;
  }

  get syncedHeight() {
    return this.fullNode.blockchainState.syncStatus.syncedHeight;
  }

  get tipHeight() {
    return this.fullNode.blockchainState.syncStatus.tipHeight;
  }

  get syncProgress() {
    if (this.tipHeight === 0) {
      return 0;
    }

    return (this.syncedHeight / this.tipHeight) * 100;
  }

  get lastUpdatedBefore() {
    return moment(this.fullNode.lastUpdate).fromNow();
  }

  get lastUpdatedState() {
    return getStateForLastUpdated(this.fullNode.lastUpdate);
  }

  get syncProgressBarType() {
    const syncProgress = this.syncProgress;

    if (syncProgress >= 66) {
      return 'success';
    }
    if (syncProgress >= 33) {
      return 'primary';
    }

    return 'secondary';
  }
}
