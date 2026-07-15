import { Injectable } from '@angular/core';

export interface ToastOptions {
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'middle';
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  async show(options: ToastOptions): Promise<any> {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${options.color || 'dark'} border-0 position-fixed`;
    toast.style.zIndex = '9999';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const pos = options.position || 'bottom';
    if (pos === 'top') {
      toast.style.top = '1rem';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
    } else if (pos === 'bottom') {
      toast.style.bottom = '1rem';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
    } else {
      toast.style.top = '50%';
      toast.style.left = '50%';
      toast.style.transform = 'translate(-50%, -50%)';
    }

    const body = document.createElement('div');
    body.className = 'd-flex';
    body.innerHTML = `
      <div class="toast-body">${options.message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    `;
    toast.appendChild(body);
    document.body.appendChild(toast);

    toast.classList.add('show');

    const duration = options.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return { toast };
  }
}
