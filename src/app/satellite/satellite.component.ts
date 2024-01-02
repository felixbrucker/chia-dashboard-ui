import {Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { faTrash, faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import {UntypedFormControl} from '@angular/forms';
import {ApiService} from '../api.service';
import {ToastService} from '../toast.service';
import {StateService} from '../state.service';

@Component({
  selector: 'app-satellite',
  templateUrl: './satellite.component.html',
  styleUrls: ['./satellite.component.scss']
})
export class SatelliteComponent implements OnInit {
  @Input() satellite: any;
  @Output() delete = new EventEmitter<void>();

  public faTrash = faTrash;
  public faEyeSlash = faEyeSlash;
  public faEye = faEye;
  public nameControl: UntypedFormControl

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private stateService: StateService,
  ) {}

  ngOnInit(): void {
    this.nameControl = new UntypedFormControl(this.satellite.name);
  }

  async updateName() {
    const newName = this.nameControl.value;
    if (newName === this.satellite.name || newName.trim().length === 0) {
      return;
    }
    this.satellite.name = newName;
    await this.apiService.updateSatellite({ id: this.satellite._id, data: { name: newName } });
    this.toastService.showSuccessToast(`Satellite ${this.satellite.name} updated`);
    await this.stateService.updateSatellites();
  }

  async toggleHidden() {
    const newHiddenValue = !this.satellite.hidden;
    this.satellite.hidden = newHiddenValue;
    await this.apiService.updateSatellite({ id: this.satellite._id, data: { hidden: newHiddenValue } });
    this.toastService.showSuccessToast(`Satellite ${this.satellite.name} updated`);
    await this.stateService.updateSatellites();
  }

  cancelNameUpdate() {
    this.nameControl.setValue(this.satellite.name);
  }

  get lastUpdatedBefore() {
    return moment(this.satellite.updatedAt).fromNow();
  }

  onDelete() {
    this.delete.emit();
  }
}
