import {
  ApplicationRef, ComponentRef, createComponent,
  EnvironmentInjector, Injectable, Type
} from '@angular/core';

import { getFocusableElements, trapFocus } from 'src/app/shared/focus-utils';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalRef: ComponentRef<any> | null = null;
  private triggerElement: HTMLElement | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private modalDiv: HTMLElement | null = null;
  private dragCleanup: (() => void) | null = null;

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

      this.initDrag(dialog);
      this.modalRef = componentRef;
    });
  }

  private initDrag(dialog: HTMLElement) {
    const header = dialog.querySelector<HTMLElement>('.gfc-modal-header') || dialog.querySelector<HTMLElement>('.modal-header');
    if (!header) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let totalDx = 0, totalDy = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, select, textarea, button, a, .btn, .btn-link')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      dialog.style.transition = 'none';
      header.classList.add('grabbing');
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      dialog.style.transform = `translate(${totalDx + dx}px, ${totalDy + dy}px)`;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      totalDx += e.clientX - startX;
      totalDy += e.clientY - startY;
      isDragging = false;
      dialog.style.transition = '';
      header.classList.remove('grabbing');
      document.body.style.userSelect = '';
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    this.dragCleanup = () => {
      header.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      dialog.style.transition = '';
    };
  }

  private close(componentRef: ComponentRef<any>) {
    if (this.dragCleanup) {
      this.dragCleanup();
      this.dragCleanup = null;
    }

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
