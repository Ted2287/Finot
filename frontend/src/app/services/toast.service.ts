import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast
    };

    this.toasts.update(current => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  success(message: string, title: string = 'Success') {
    this.show({ type: 'success', title, message });
  }

  error(message: string, title: string = 'Error') {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(message: string, title: string = 'Warning') {
    this.show({ type: 'warning', title, message });
  }

  info(message: string, title: string = 'Info') {
    this.show({ type: 'info', title, message });
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
