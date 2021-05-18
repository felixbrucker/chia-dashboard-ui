import {Component, OnInit} from '@angular/core';
import {UpdateService} from "./update.service";
import {SeoService} from "./seo.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter, map, mergeMap} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private updateService: UpdateService,
    private seoService: SeoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    ).subscribe((event) => {
      this.updateTitle(event.titleSuffix);
    });
  }

  updateTitle(titleSuffix) {
    let title = 'Chia-Dashboard';
    if (titleSuffix) {
      title += ` | ${titleSuffix}`;
    }
    this.seoService.updateTitle(title);
  }
}
