import {Injectable} from "@angular/core";
import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

@Injectable({
  providedIn: 'root',
})
export class GithubApiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
    });
  }

  async getLatestRelease({ owner, repo }) {
    return this.request({ url: `/repos/${owner}/${repo}/releases/latest` });
  }

  async request(config: AxiosRequestConfig) {
    const { data } = await this.client(config);

    return data;
  }
}
