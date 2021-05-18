import {Injectable} from "@angular/core";
import {GithubApiService} from './github-api.service';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SatelliteReleasesService {
  public latestVersion = new BehaviorSubject<string>(null);
  private updateLatestVersionInterval: any;

  constructor(private githubApiService: GithubApiService) {}

  async init() {
    await this.updateLatestVersion();
    if (!this.updateLatestVersionInterval) {
      this.updateLatestVersionInterval = setInterval(this.updateLatestVersion.bind(this), 10 * 60 * 1000);
    }
  }

  async updateLatestVersion() {
    try {
      const release = await this.githubApiService.getLatestRelease({ owner: 'felixbrucker', repo: 'chia-dashboard-satellite' });
      if (!this.latestVersion.getValue() || this.latestVersion.getValue() !== release.tag_name) {
        this.latestVersion.next(release.tag_name);
      }
    } catch (err) {}
  }
}
