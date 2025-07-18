import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Message } from '../../../../shared/model/message';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [],
  templateUrl: './image-preview.component.html',
})
export class ImagePreviewComponent {
  @Input() messageViewed!: { id: string; message: Message };
  @Output() closeMessageViewed = new EventEmitter();

  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;

  scale = 1;

  constructor(private cdr: ChangeDetectorRef) {}

  zoomIn() {
    this.scale += 0.1;
    this.cdr.detectChanges();
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale - 0.1);
    this.cdr.detectChanges();
  }

  resetZoom() {
    this.scale = 1;
    this.cdr.detectChanges();
  }

  download() {
    fetch(this.messageViewed.message.mediaUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = this.messageViewed.message.mediaUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => console.error('Image download failed:', err));
  }
}
