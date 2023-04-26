import {Component, Inject, Input, OnInit} from '@angular/core';
import {StateService} from '../state.service';
import {ApiService} from '../api.service';
import {ToastService} from '../toast.service';
import {WINDOW} from '../window.provider';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import {Router} from '@angular/router';
import {LocalStorageService} from '../local-storage.service'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public faCopy = faCopy;

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private toastService: ToastService,
    @Inject(WINDOW) private window: Window,
    private router: Router,
    private localStorageService: LocalStorageService
  ) { }

  async ngOnInit() {
    if (!this.apiService.isAuthenticated) {
      await this.router.navigate(['/login']);
      return;
    }
    await this.stateService.init();
  }

  get user() {
    return this.stateService.user;
  }

  get shareUrl() {
    return `${this.window.location.protocol}//${this.window.location.host}/shared/${this.user?.shareKey}`;
  }

  async toggleShared() {
    const isShared = !this.user.shareKey;
    await this.apiService.updateUser({ data: { isShared } });
    this.toastService.showSuccessToast(`Dashboard is ${isShared ? 'shared' : 'not shared anymore'} now!`);
    await this.stateService.updateUser();
  }

  public get hideDismissedUpdateNotifications(): boolean {
    return JSON.parse(this.localStorageService.getItem('hideDismissedUpdateNotifications')) ?? false
  }

  public set hideDismissedUpdateNotifications(hideDismissedUpdateNotifications: boolean) {
    this.localStorageService.setItem('hideDismissedUpdateNotifications', JSON.stringify(hideDismissedUpdateNotifications))
  }
}
