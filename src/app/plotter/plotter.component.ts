import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-plotter',
  templateUrl: './plotter.component.html',
  styleUrls: ['./plotter.component.scss']
})
export class PlotterComponent implements OnInit {
  @Input() plotter: any;

  constructor() { }

  ngOnInit(): void {
  }

  trackBy(index, item) {
    return item.id;
  }

  get satelliteName() {
    return this.plotter.satelliteName;
  }

  get status() {
    if (this.lastUpdatedState !== 0) {
      return 'Unknown';
    }
    if (this.runningJobsCount > 0) {
      return 'Plotting';
    }
    if (this.pendingJobsCount > 0) {
      return 'Stuck';
    }

    return 'Idle';
  }

  get colorClassForStatus() {
    const status = this.status;
    if (status === 'Plotting') {
      return 'color-green';
    }
    if (status === 'Unknown') {
      return 'color-orange';
    }
    if (status === 'Stuck') {
      return 'color-red';
    }

    return 'color-blue';
  }

  get runningJobsCount() {
    return this.runningJobs.length;
  }

  get pendingJobsCount() {
    return this.jobs.filter(job => job.state === 'SUBMITTED').length;
  }

  get runningJobs() {
    return this.jobs.filter(job => job.state === 'RUNNING');
  }

  get jobs() {
    return this.plotter.jobs;
  }

  get completedPlotsToday() {
    return this.plotter.completedPlotsToday;
  }

  get completedPlotsYesterday() {
    return this.plotter.completedPlotsYesterday;
  }

  get lastUpdatedBefore() {
    if (moment(this.plotter.satelliteUpdatedAt).isAfter(this.plotter.lastUpdate)) {
      return moment(this.plotter.satelliteUpdatedAt).fromNow();
    }

    return moment(this.plotter.lastUpdate).fromNow();
  }

  getJobRuntime(job) {
    if (!job.startedAt) {
      return 'N/A';
    }

    return moment(job.startedAt).fromNow(true);
  }

  getJobProgress(job) {
    if (job.progress === undefined) {
      return 'N/A';
    }

    return `${(job.progress * 100).toFixed(2)}%`;
  }

  get lastUpdatedState() {
    const diff = moment().diff(this.plotter.lastUpdate, 'minutes');
    const diffSatelliteUpdate = moment().diff(this.plotter.satelliteUpdatedAt, 'minutes');
    if (diff < 11 || diffSatelliteUpdate < 3) {
      return 0;
    }
    if (diff < 20 || diffSatelliteUpdate < 7) {
      return 1;
    }

    return 2;
  }
}
