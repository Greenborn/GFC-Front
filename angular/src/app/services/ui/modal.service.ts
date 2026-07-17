import {
  ApplicationRef, ComponentRef, createComponent,
  EnvironmentInjector, Injectable, Type
} from '@angular/core';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled]):not([hidden])',
  'input:not([disabled]):not([hidden])',
  'select:not([disabled]):not([hidden])',
  'textarea:not([disabled]):not([hidden])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]'
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
    .filter(el => el.offsetParent !== null || el === container);
}

function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') return;
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalRef: ComponentRef<any> | null = null;
  private triggerElement: HTMLElement | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private modalDiv: HTMLElement | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  async showModal<T>(
    component: Type<T>,
    componentProps: Record<string, any> = {},
    cssClass: string = '',
    dialogClass: string = '',
    ariaLabel: string = 'Diálogo'
  ): Promise<any> {
    return new Promise((resolve) => {
      this.dismiss();

      this.triggerElement = document.activeElement as HTMLElement;

      const componentRef = createComponent(component, {
        environmentInjector: this.injector,
      });

      const dismissFn = (data?: any) => {
        this.close(componentRef);
        resolve(data ?? {});
      };

      Object.assign(componentRef.instance, componentProps);
      componentRef.instance['dismiss'] = dismissFn;
      componentRef.changeDetectorRef.detectChanges();
      this.appRef.attachView(componentRef.hostView);

      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);

      const modalDiv = document.createElement('div');
      modalDiv.className = `modal fade show d-block${cssClass ? ' ' + cssClass : ''}`;
      modalDiv.style.display = 'block';
      modalDiv.tabIndex = -1;
      modalDiv.setAttribute('role', 'dialog');
      modalDiv.setAttribute('aria-modal', 'true');
      modalDiv.setAttribute('aria-label', ariaLabel);
      this.modalDiv = modalDiv;

      const dialog = document.createElement('div');
      dialog.className = `modal-dialog modal-dialog-centered modal-dialog-scrollable${dialogClass ? ' ' + dialogClass : ''}`;

      const content = document.createElement('div');
      content.className = 'modal-content';
      content.appendChild(componentRef.location.nativeElement);
      dialog.appendChild(content);
      modalDiv.appendChild(dialog);
      document.body.appendChild(modalDiv);

      modalDiv.addEventListener('click', (e) => {
        if (e.target === modalDiv) dismissFn();
      });

      const appRoot = document.querySelector('app-root');
      if (appRoot) appRoot.setAttribute('aria-hidden', 'true');

      setTimeout(() => {
        const focusable = getFocusableElements(modalDiv);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalDiv.focus();
        }
      });

      this.keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          dismissFn();
          return;
        }
        if (this.modalDiv) trapFocus(e, this.modalDiv);
      };
      document.addEventListener('keydown', this.keydownHandler);

      this.modalRef = componentRef;
    });
  }

  private close(componentRef: ComponentRef<any>) {
    const el = componentRef.location.nativeElement;
    const modalDiv = el.closest('.modal');
    const backdrop = document.querySelector('.modal-backdrop.fade.show');
    if (modalDiv) modalDiv.remove();
    if (backdrop) backdrop.remove();
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    this.modalRef = null;
    this.modalDiv = null;

    const appRoot = document.querySelector('app-root');
    if (appRoot) appRoot.removeAttribute('aria-hidden');

    if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
      this.triggerElement.focus();
    }
    this.triggerElement = null;

    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  dismiss(data?: any) {
    if (this.modalRef) {
      const dismiss = this.modalRef.instance['dismiss'];
      if (typeof dismiss === 'function') {
        dismiss(data);
      } else {
        this.close(this.modalRef);
      }
    }
  }
}
