import {Injectable} from "@angular/core";
import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {LocalStorageService} from './local-storage.service';
import {Router} from '@angular/router';
import {apiBaseUrl} from './config';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly client: AxiosInstance;
  private isRefreshing: boolean = false;
  public shareKey: string = null;
  public isAuthenticated: boolean = !!this.accessToken && !!this.refreshToken && !this.shareKey;

  private get accessToken() {
    return this.shareKey || this.localStorageService.getItem('auth/accessToken');
  }

  private get refreshToken() {
    return this.localStorageService.getItem('auth/refreshToken');
  }

  private get expiresAt() {
    const expiresAt = this.localStorageService.getItem('auth/expiresAt');
    if (!expiresAt) {
      return moment();
    }

    return moment(expiresAt);
  }

  private get requiresRefresh() {
    return this.expiresAt.diff(moment(), 'seconds') < 30;
  }

  constructor(private localStorageService: LocalStorageService, private router: Router) {
    this.client = axios.create({
      baseURL: apiBaseUrl,
    });
    this.client.interceptors.request.use(
      async config => {
        // @ts-ignore
        if (config.noToken || !this.accessToken) {
          return config;
        }
        while (this.isRefreshing) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        config.headers.Authorization = `Bearer ${this.accessToken}`;

        return config;
      },
      Promise.reject
    );
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (!error.response || error.response.status !== 401 || !error.config || error.config.isRetryRequest) {
          return Promise.reject(error);
        }
        if (this.shareKey) {
          await this.router.navigate(['/login']);

          return Promise.reject(error);
        }
        if (!this.refreshToken) {
          await this.logout();

          return Promise.reject(error);
        }
        error.config.isRetryRequest = true;
        if (this.isRefreshing && !error.config.noToken) {
          return this.client(error.config);
        }
        this.isRefreshing = true;
        try {
          await this.refresh();
        } catch (err) {
          await this.logout();

          return Promise.reject(error);
        } finally {
          this.isRefreshing = false;
        }
        this.isAuthenticated = true;

        return this.client(error.config);
      }
    );
    this.isRefreshing = false;
    setInterval(async () => {
      if (this.isRefreshing || !this.refreshToken || !this.requiresRefresh) {
        return;
      }
      this.isRefreshing = true;
      try {
        await this.refresh();
      } finally {
        this.isRefreshing = false;
      }
    }, 5 * 1435);
  }

  setShareKey(shareKey) {
    this.shareKey = shareKey;
    this.isAuthenticated = shareKey ? false : (!!this.accessToken && !!this.refreshToken);
  }

  async getUser() {
    return this.request({ url: 'me' });
  }

  async getSatellites() {
    return this.request({ url: 'satellites' });
  }

  async createSatellite(name) {
    return this.request({ method: 'post', url: 'satellite', data: { name } });
  }

  async deleteSatellite(id) {
    return this.request({ method: 'delete', url: `satellite/${id}` });
  }

  async updateSatellite({ id, data }) {
    return this.request({ method: 'patch', url: `satellite/${id}`, data });
  }

  async updateUser({ data }) {
    return this.request({ method: 'patch', url: 'me', data });
  }

  async getSharedSatellites() {
    return this.request({ url: 'shared/satellites' });
  }

  async getRates() {
    // @ts-ignore
    return this.request({ url: 'rates', noToken: true });
  }

  async ping() {
    // @ts-ignore
    const { success } = await this.request({ url: 'ping', noToken: true });

    return success;
  }

  async refresh() {
    const tokens = await this.authenticateWithRefreshToken({ refreshToken: this.refreshToken });
    this.persistTokens(tokens);
  }

  persistTokens(tokens) {
    this.localStorageService.setItem('auth/accessToken', tokens.accessToken);
    this.localStorageService.setItem('auth/refreshToken', tokens.refreshToken);
    this.localStorageService.setItem('auth/expiresAt', moment().add(tokens.expiresIn, 'seconds').toISOString());
  }

  async authenticateWithCode({ grantType, code, redirectUri, state = undefined }) {
    return this.authenticate({
      grant_type: grantType,
      code,
      redirectUri,
      state,
    });
  }

  async authenticateWithRefreshToken({ refreshToken }) {
    return this.authenticate({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  async authenticate(data) {
    const { access_token, refresh_token, expires_in } = await this.request({
      method: 'post',
      url: 'oauth/token',
      data,
      // @ts-ignore
      noToken: true,
    });

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
    };
  }

  async request(config: AxiosRequestConfig) {
    const { data } = await this.client(config);

    return data;
  }

  async logout() {
    this.localStorageService.removeItem('auth/accessToken');
    this.localStorageService.removeItem('auth/refreshToken');
    this.localStorageService.removeItem('auth/expiresAt');
    this.isAuthenticated = false;
    await this.router.navigate(['/login']);
  }
}
