import {ToastrService} from 'ngx-toastr';
import {Injectable} from '@angular/core';
import {ActiveToast} from 'ngx-toastr/toastr/toastr.service'
import {IndividualConfig} from 'ngx-toastr/toastr/toastr-config'

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  showSuccessToast(msg, title = '', options = {}) {
    options = Object.assign({
      timeOut: 1500,
      progressBar: true,
      tapToDismiss: false,
    }, options);
    this.toastr.success(msg, title, options);
  }

  showInfoToast(msg, title = '', options = {}) {
    options = Object.assign({
      timeOut: 3000,
      progressBar: true,
      tapToDismiss: false,
    }, options);
    this.toastr.info(msg, title, options);
  }

  showErrorToast(msg, title = '', options = {}) {
    options = Object.assign({
      timeOut: 5000,
      progressBar: true,
      tapToDismiss: false,
    }, options);
    this.toastr.error(msg, title, options);
  }

  public showWarningConfirmToast(msg: string, title = '', options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    options = Object.assign({
      disableTimeOut: true,
      tapToDismiss: true,
      closeButton: true,
    }, options);

    return this.toastr.warning(msg, title, options);
  }
}
