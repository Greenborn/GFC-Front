import { AfterContentChecked, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, HostListener, Input, OnChanges, OnDestroy, QueryList, Renderer2, SimpleChanges } from '@angular/core';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1200;
const RESIZE_DEBOUNCE = 150;

export interface SlidesOptions {
  initialSlide?: number;
  slidesPerView?: number;
  slidesPerViewTablet?: number;
  slidesPerViewDesktop?: number;
  autoplay?: boolean | { delay: number };
  speed?: number;
  pagination?: boolean;
  navigation?: boolean;
}

@Component({
  selector: 'app-slides',
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlidesComponent implements AfterContentInit, AfterContentChecked, OnChanges, OnDestroy {
  @Input() options: SlidesOptions = {};

  @ContentChildren('slide', { descendants: true, read: ElementRef })
  slideElements!: QueryList<ElementRef>;

  currentIndex = 0;
  totalSlides = 0;

  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchDeltaX = 0;
  private isSwiping = false;
  private containerEl!: HTMLElement;
  private trackEl!: HTMLElement;
  private initialized = false;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private currentWidth = 0;
  private cachedSlideW = 0;
  private cachedBullets: number[] = [];

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {
    this.currentWidth = window.innerWidth;
  }

  get deviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (this.currentWidth >= DESKTOP_BREAKPOINT) return 'desktop';
    if (this.currentWidth >= TABLET_BREAKPOINT) return 'tablet';
    return 'mobile';
  }

  get isDesktop(): boolean {
    return this.deviceType === 'desktop';
  }

  get slidesPerView(): number {
    if (this.deviceType === 'desktop' && this.options.slidesPerViewDesktop) {
      return this.options.slidesPerViewDesktop;
    }
    if (this.deviceType === 'tablet' && this.options.slidesPerViewTablet) {
      return this.options.slidesPerViewTablet;
    }
    return this.options.slidesPerView || 1;
  }

  get canNavigate(): boolean {
    if (this.options.navigation === false) return false;
    return this.totalSlides > this.slidesPerView;
  }

  get transform(): string {
    if (!this.totalSlides) return 'translateX(0)';
    return `translateX(-${this.currentIndex * this.cachedSlideW}px)`;
  }

  get transitionDuration(): string {
    return `${this.options.speed || 300}ms`;
  }

  get bullets(): number[] {
    return this.cachedBullets;
  }

  get bulletIndex(): number {
    return Math.min(this.currentIndex, Math.max(0, this.totalSlides - this.slidesPerView));
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.currentWidth = window.innerWidth;
      this.layout();
      this.cdr.markForCheck();
    }, RESIZE_DEBOUNCE);
  }

  ngAfterContentInit(): void {
    this.containerEl = this.elementRef.nativeElement.querySelector('.app-slides-container') as HTMLElement;
    this.trackEl = this.elementRef.nativeElement.querySelector('.app-slides-track') as HTMLElement;
    this.updateSlides();
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  ngAfterContentChecked(): void {
    if (this.slideElements.length !== this.totalSlides) {
      this.updateSlides();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange && this.initialized) {
      this.layout();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
  }

  private layout(): void {
    if (!this.containerEl || !this.totalSlides) return;
    const spv = this.slidesPerView;
    this.cachedSlideW = this.containerEl.offsetWidth / spv;
    const trackW = this.totalSlides * this.cachedSlideW;
    this.renderer.setStyle(this.trackEl, 'width', `${trackW}px`);
    this.slideElements.forEach(el => {
      this.renderer.setStyle(el.nativeElement, 'flex', `0 0 ${this.cachedSlideW}px`);
      this.renderer.setStyle(el.nativeElement, 'max-width', `${this.cachedSlideW}px`);
    });
    if (this.initialized && this.currentIndex > Math.max(0, this.totalSlides - spv)) {
      this.currentIndex = Math.max(0, this.totalSlides - spv);
    }
    this.updateBullets();
  }

  private updateBullets(): void {
    const count = Math.max(1, this.totalSlides - this.slidesPerView + 1);
    if (this.cachedBullets.length !== count) {
      this.cachedBullets = Array.from({ length: count }, (_, i) => i);
    }
  }

  private updateSlides(): void {
    this.totalSlides = this.slideElements.length;
    this.layout();

    if (!this.initialized) {
      this.currentIndex = Math.min(
        this.options.initialSlide || 0,
        Math.max(0, this.totalSlides - this.slidesPerView)
      );
      this.initialized = true;
    } else if (this.currentIndex > Math.max(0, this.totalSlides - this.slidesPerView)) {
      this.currentIndex = Math.max(0, this.totalSlides - this.slidesPerView);
    }
    this.cdr.markForCheck();
  }

  slideNext(): void {
    const max = Math.max(0, this.totalSlides - this.slidesPerView);
    if (this.currentIndex < max) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.cdr.markForCheck();
  }

  slidePrev(): void {
    const max = Math.max(0, this.totalSlides - this.slidesPerView);
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = max;
    }
    this.cdr.markForCheck();
  }

  slideTo(index: number): void {
    const max = Math.max(0, this.totalSlides - this.slidesPerView);
    if (index >= 0 && index <= max) {
      this.currentIndex = index;
      this.cdr.markForCheck();
    }
  }

  isBeginning(): boolean {
    return this.currentIndex === 0;
  }

  isEnd(): boolean {
    const max = Math.max(0, this.totalSlides - this.slidesPerView);
    return this.currentIndex >= max;
  }

  length(): number {
    return this.totalSlides;
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchDeltaX = 0;
    this.isSwiping = true;
    this.stopAutoplay();
  }

  onTouchMove(e: TouchEvent): void {
    if (!this.isSwiping) return;
    this.touchDeltaX = e.touches[0].clientX - this.touchStartX;
  }

  onTouchEnd(): void {
    if (!this.isSwiping) return;
    if (this.touchDeltaX < -50) {
      this.slideNext();
    } else if (this.touchDeltaX > 50) {
      this.slidePrev();
    }
    this.touchDeltaX = 0;
    this.isSwiping = false;
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  private startAutoplay(): void {
    if (this.autoplayTimer) return;
    const delay = typeof this.options.autoplay === 'object'
      ? (this.options.autoplay as any).delay || 3000
      : 3000;
    this.autoplayTimer = setInterval(() => this.slideNext(), delay);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }
}
