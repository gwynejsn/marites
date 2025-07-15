import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() data!: {
    mainMessage: string;
    description: string;
    cancelText: string;
    confirmText: string;
  };

  @Output() confirm = new EventEmitter();
  @Output() cancel = new EventEmitter();
}
