import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { storeStructure } from '../../../../app.config';
import { selectCurrUserUID } from '../../../../authentication/store/authentication.selectors';
import { MessagePreview } from '../../../../shared/model/message-preview';

@Component({
  selector: 'app-message-preview',
  imports: [CommonModule],
  templateUrl: './message-preview.component.html',
})
export class MessagePreviewComponent {
  @Input() messagePreview!: MessagePreview;
  currUserUID!: string | null;

  constructor(private store$: Store<storeStructure>) {
    store$
      .pipe(select(selectCurrUserUID))
      .subscribe((u) => (this.currUserUID = u));
  }
}
