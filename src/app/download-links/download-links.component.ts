import { Component, OnInit } from '@angular/core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-download-links',
  templateUrl: './download-links.component.html',
  styleUrls: ['./download-links.component.scss']
})
export class DownloadLinksComponent implements OnInit {
  public faDownload = faDownload;

  constructor() { }

  ngOnInit(): void {
  }

  get binaryDownloadUrl() {
    return 'https://github.com/felixbrucker/chia-dashboard-satellite/releases/latest';
  }
}
