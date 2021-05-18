import {Component, Input, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @Input() title: String = '';
  @Input() content: String = '';

  @ViewChild('confirmationModal') modal;

  constructor(private modalService: NgbModal) {}

  async confirm({ title = null, content = null } = {}) {
    if (title) {
      this.title = title;
    }
    if (content) {
      this.content = content;
    }
    try {
      await this.modalService.open(this.modal).result;

      return true;
    } catch (err) {
      return false;
    }
  }
}
