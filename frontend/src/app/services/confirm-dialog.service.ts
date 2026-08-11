import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  state = signal<ConfirmState | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.set({
        type: 'warning',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        ...options,
        resolve
      });
    });
  }

  handleConfirm() {
    const current = this.state();
    if (current) {
      current.resolve(true);
      this.state.set(null);
    }
  }

  handleCancel() {
    const current = this.state();
    if (current) {
      current.resolve(false);
      this.state.set(null);
    }
  }
}
