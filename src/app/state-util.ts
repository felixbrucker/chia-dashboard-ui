import * as moment from 'moment';

export function getStateForLastUpdated(lastUpdated) {
  const diff = moment().diff(lastUpdated, 'minutes');
  if (diff < 3) {
    return 0;
  }
  if (diff < 7) {
    return 1;
  }

  return 2;
}
export function getColorClassForSyncStatus(syncStatus) {
  if (syncStatus === 'Synced') {
    return 'color-green';
  }
  if (syncStatus === 'Syncing' || syncStatus === 'Unknown') {
    return 'color-orange';
  }

  return 'color-red';
}
