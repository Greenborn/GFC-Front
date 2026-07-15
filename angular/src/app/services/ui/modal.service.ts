import {
  ApplicationRef, ComponentRef, createComponent,
  EnvironmentInjector, Injectable, Type
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalRef: ComponentRef<any> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  async showModal<T>(
    component: Type<T>,
    componentProps: Record<string, any> = {},
    cssClass: string = ''
  ): Promise<any> {
    return new Promise((resolve) => {
      this.dismiss();

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

      const dialog = document.createElement('div');
      dialog.className = 'modal-dialog modal-dialog-centered modal-dialog-scrollable';

      const content = document.createElement('div');
      content.className = 'modal-content';
      content.appendChild(componentRef.location.nativeElement);
      dialog.appendChild(content);
      modalDiv.appendChild(dialog);
      document.body.appendChild(modalDiv);

      modalDiv.addEventListener('click', (e) => {
        if (e.target === modalDiv) dismissFn();
      });

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
