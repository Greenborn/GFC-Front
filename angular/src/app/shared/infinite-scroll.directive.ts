import { Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

@Directive({
  standalone: false,
  selector: '[appInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnDestroy {
  @Input() set appInfiniteScroll(enabled: boolean | '') {
    this._enabled = enabled === '' || enabled === true;
  }
  @Output() loadMore = new EventEmitter<void>();

  private _enabled: boolean = true;
  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this._enabled) {
        this.loadMore.emit();
      }
    }, { rootMargin: '100px' });
    this.observer.observe(el.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
