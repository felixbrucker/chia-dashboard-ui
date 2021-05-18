import {Component, ViewChild} from '@angular/core';
import {ApiService} from '../api.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {faCircleNotch} from '@fortawesome/free-solid-svg-icons';
import {StateService} from '../state.service';
import {ToastService} from '../toast.service';
import { faCopy } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-add-new-satellite-modal',
  templateUrl: './add-new-satellite-modal.component.html',
  styleUrls: ['./add-new-satellite-modal.component.scss'],
})
export class AddNewSatelliteModalComponent {
  @ViewChild('addSatelliteModal') modal;

  public newSatelliteName = null;
  public newSatellite = { apiKey: null };
  public isLoading = false;
  public faCircleNotch = faCircleNotch;
  public faCopy = faCopy;

  constructor(
    private apiService: ApiService,
    private modalService: NgbModal,
    private stateService: StateService,
    private toastService: ToastService,
  ) {}

  async createSatellite() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    try {
      this.newSatellite = await this.apiService.createSatellite(this.newSatelliteName);
    } finally {
      this.isLoading = false;
    }
    this.toastService.showSuccessToast(`New Satellite ${this.newSatelliteName} created`);
    await this.stateService.updateSatellites();
  }

  onModalClose() {
    this.newSatelliteName = null;
    this.newSatellite = { apiKey: null };
  }

  openModal() {
    this.modalService.open(this.modal).result.then(() => {
      this.onModalClose();
    }, () => {
      this.onModalClose();
    });
  }
}
