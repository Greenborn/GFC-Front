import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type GenericAlertType = 'info' | 'warning' | 'error' | 'confirm';

export interface GenericAlertButton {
  text: string;
  role?: 'cancel' | 'confirm';
  handler?: () => boolean | void | Promise<void>;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-generic-alert',
  templateUrl: './generic-alert.component.html',
  styleUrls: ['./generic-alert.component.scss'],
})
export class GenericAlertComponent {

  @Input() header = '';
  @Input() message = '';
  @Input() type: GenericAlertType = 'info';
  @Input() buttons: GenericAlertButton[] = [];
  @Input() modalController: any;

  get isConfirm(): boolean {
    return this.type === 'confirm';
  }

  get icon(): string {
    switch (this.type) {
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'confirm': return 'bi-question-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  }

  get colorClass(): string {
    switch (this.type) {
      case 'warning': return 'text-warning';
      case 'error': return 'text-danger';
      case 'confirm': return 'text-primary';
      default: return 'text-info';
    }
  }

  async onClick(btn: GenericAlertButton) {
    if (btn.handler) {
      await btn.handler();
    }
    this.modalController.dismiss({ role: btn.role });
  }

  close() {
    this.modalController.dismiss({ role: 'cancel' });
  }
}
