import {Component, Inject, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {Router} from "@angular/router";
import {faDiscord, faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import {discordClientId, githubClientId, googleClientId, requestDiscordGuildPermission} from '../config';
import {WINDOW} from '../window.provider';
import { v4 as uuidv4 } from 'uuid';
import {StateService} from '../state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public faGoogle = faGoogle;
  public faDiscord = faDiscord;
  public faGithub = faGithub;
  private state: string;

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private router: Router,
    @Inject(WINDOW) private window: Window,
  ) {}

  async ngOnInit() {
    this.state = uuidv4();
    if (this.apiService.shareKey) {
      this.apiService.setShareKey(null);
      this.stateService.clear();
    }
    if (!this.apiService.isAuthenticated) {
      return;
    }
    await this.router.navigate(['/']);
  }

  get isDiscordEnabled() {
    return !!discordClientId;
  }

  get isGithubEnabled() {
    return !!githubClientId;
  }

  get isGoogleEnabled() {
    return !!googleClientId;
  }

  get discordAuthUrl() {
    return `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${this.getRedirectUri('discord')}&response_type=code&scope=${this.discordScopes}&prompt=none`;
  }

  get githubAuthUrl() {
    return `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${this.getRedirectUri('github')}&scope=read:user user:email&state=${this.state}`;
  }

  get googleAuthUrl() {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${this.getRedirectUri('google')}&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile&state=${this.state}&response_type=code`;
  }

  getRedirectUri(provider) {
    return `${this.window.location.protocol}//${this.window.location.host}/oauth/callback/${provider}`;
  }

  get discordScopes() {
    const scopes = [
      'identify',
      'email',
    ];
    if (requestDiscordGuildPermission) {
      scopes.push('guilds');
    }

    return scopes.join(' ');
  }
}
