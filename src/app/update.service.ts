import {Injectable} from "@angular/core";
import {SwUpdate} from "@angular/service-worker";
import {ToastService} from "./toast.service";

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(
    swUpdate: SwUpdate,
    toastService: ToastService,
  ) {
    swUpdate.available.subscribe(async () => {
      toastService.showInfoToast('Updating to the latest version ..', '', { timeOut: 2 * 1000 });
      await Promise.all([
        swUpdate.activateUpdate(),
        new Promise(resolve => setTimeout(resolve, 2 * 1000)),
      ]);
      document.location.reload();
    });
  }
}
