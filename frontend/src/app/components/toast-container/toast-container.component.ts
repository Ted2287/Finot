import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      <div *ngFor="let toast of toastService.toasts()"
           [ngClass]="{
             'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200': toast.type === 'success',
             'bg-rose-500/15 border-rose-500/40 text-rose-900 dark:text-rose-200': toast.type === 'error',
             'bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-200': toast.type === 'warning',
             'bg-sky-500/15 border-sky-500/40 text-sky-900 dark:text-sky-200': toast.type === 'info'
           }"
           class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl dark:shadow-2xl bg-white/90 dark:bg-slate-900/90 transition-all duration-300 transform translate-y-0 animate-slide-in">
        
        <!-- Icon -->
        <div [ngClass]="{
          'bg-emerald-500 text-white': toast.type === 'success',
          'bg-rose-500 text-white': toast.type === 'error',
          'bg-amber-500 text-white': toast.type === 'warning',
          'bg-sky-500 text-white': toast.type === 'info'
        }" class="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-md">
          <span class="material-icons text-lg">
            {{ toast.type === 'success' ? 'check_circle' : (toast.type === 'error' ? 'error' : (toast.type === 'warning' ? 'warning' : 'info')) }}
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 pr-2">
          <h4 *ngIf="toast.title" class="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-90">
            {{ toast.title }}
          </h4>
          <p class="text-xs sm:text-sm font-medium leading-snug whitespace-pre-line">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button (click)="toastService.remove(toast.id)" 
                class="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors">
          <span class="material-icons text-base">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-16px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-slide-in {
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
