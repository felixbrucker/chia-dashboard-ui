import { Component } from '@angular/core';
import {faDiscord, faGithub, faPaypal} from "@fortawesome/free-brands-svg-icons";
import * as moment from 'moment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  public faDiscord = faDiscord;
  public faGithub = faGithub;
  public faPaypal = faPaypal;

  public currentYear: string = moment().format('YYYY');
}
