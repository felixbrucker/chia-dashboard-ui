import { Component, OnInit } from '@angular/core';
import {faDiscord, faGithub, faPaypal} from "@fortawesome/free-brands-svg-icons";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public faDiscord = faDiscord;
  public faGithub = faGithub;
  public faPaypal = faPaypal;

  ngOnInit() {
  }

}
