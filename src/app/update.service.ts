import {ApplicationRef, Injectable, OnDestroy} from '@angular/core'
import {SwUpdate, VersionReadyEvent} from '@angular/service-worker'
import {ToastService} from './toast.service'
import {filter, first} from 'rxjs/operators'
import {concat, interval, Subscription} from 'rxjs'
import {sleep} from './util/sleep'

@Injectable({
  providedIn: 'root',
})
export class UpdateService implements OnDestroy {
  private readonly subscriptions: Subscription[] = [
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(async () => {
        this.toastService.showInfoToast('Updating to the latest version ..', '', { timeOut: 2 * 1000 })
        await sleep(2 * 1000)
        await this.swUpdate.activateUpdate()
        document.location.reload()
      }),
  ]

  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly toastService: ToastService,
    appRef: ApplicationRef
  ) {
    if (!swUpdate.isEnabled) {
      return
    }
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true))
    const everySixHours$ = interval(6 * 60 * 60 * 1000)
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$)

    this.subscriptions.push(everySixHoursOnceAppIsStable$.subscribe(() => swUpdate.checkForUpdate()))
  }

  public ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe())
  }
}
