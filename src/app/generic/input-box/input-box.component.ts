import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-box.component.html',
})
export class InputBoxComponent {
  @Input() data!: {
    title?: string;
    placeholder?: string;
    defaultValue?: string;
    cancelText?: string;
    confirmText?: string;
  };

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  value: string = '';

  ngOnInit() {
    this.value = this.data.defaultValue || '';
  }

  submit() {
    this.confirm.emit(this.value.trim());
  }
}
