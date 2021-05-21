import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../api.service';
import {LocalStorageService} from '../local-storage.service';
import {ToastService} from '../toast.service';
import {StateService} from '../state.service';
import {WINDOW} from '../window.provider';

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})
export class OAuthComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private stateService: StateService,
    @Inject(WINDOW) private window: Window,
  ) {}

  async ngOnInit() {
    try {
      const error = this.activatedRoute.snapshot.queryParamMap.get('error');
      if (error) {
        this.toastService.showErrorToast(`Login failed: ${error}`);
        await this.router.navigate(['/login']);

        return;
      }
      const identityProvider = this.activatedRoute.snapshot.paramMap.get('identityProvider');
      const tokens = await this.apiService.authenticateWithCode({
        grantType: `${identityProvider}_auth_code`,
        code: this.activatedRoute.snapshot.queryParamMap.get('code'),
        redirectUri: this.getRedirectUri(identityProvider),
        state: this.activatedRoute.snapshot.queryParamMap.get('state'),
      });
      this.apiService.persistTokens(tokens);
    } catch (err) {
      let errorMessage = err.message;
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      this.toastService.showErrorToast(`Login failed: ${errorMessage}`);
      await this.router.navigate(['/login']);

      return;
    }
    this.apiService.isAuthenticated = true;
    await this.stateService.init();
    this.toastService.showSuccessToast('Successfully logged in');
    await this.router.navigate(['/']);
  }

  getRedirectUri(provider) {
    return `${this.window.location.protocol}//${this.window.location.host}/oauth/callback/${provider}`;
  }
}
