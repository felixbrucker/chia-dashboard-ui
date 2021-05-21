import {Component, OnInit, ViewChild} from '@angular/core';
import {StateService} from '../state.service';
import {ApiService} from '../api.service';
import { faSatellite } from '@fortawesome/free-solid-svg-icons';
import {ConfirmationModalComponent} from '../confirmation-modal/confirmation-modal.component';
import {ToastService} from '../toast.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-satellite-list',
  templateUrl: './satellite-list.component.html',
  styleUrls: ['./satellite-list.component.scss']
})
export class SatelliteListComponent implements OnInit {
  @ViewChild(ConfirmationModalComponent) satelliteDeletionConfirmationModal;
  public faSatellite = faSatellite;

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  async ngOnInit() {
    if (!this.apiService.isAuthenticated) {
      await this.router.navigate(['/login']);
      return;
    }
    await this.stateService.init();
  }

  trackBy(index, satellite) {
    return satellite._id;
  }

  get isInitialLoading() {
    return this.stateService.isInitialLoading;
  }

  get satellites() {
    return this.stateService.satellites;
  }

  async onDelete(satellite) {
    const confirmed = await this.satelliteDeletionConfirmationModal.confirm({
      title: 'Delete satellite',
      content: `Do you really want to delete the satellite "${satellite.name}"?`,
    });
    if (!confirmed) {
      return;
    }
    await this.apiService.deleteSatellite(satellite._id);
    this.toastService.showSuccessToast(`Satellite ${satellite.name} deleted`);
    await this.stateService.updateSatellites();
  }
}
