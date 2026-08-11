import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmService.state()" 
         class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      
      <!-- Modal Box -->
      <div class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-scale-up">
        
        <!-- Header & Icon -->
        <div class="flex items-start gap-4">
          <div [ngClass]="{
            'bg-rose-500/10 text-rose-500 border-rose-500/20': confirmService.state()?.type === 'danger',
            'bg-amber-500/10 text-amber-500 border-amber-500/20': confirmService.state()?.type === 'warning',
            'bg-primary-500/10 text-primary-500 border-primary-500/20': confirmService.state()?.type === 'info'
          }" class="h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0">
            <span class="material-icons text-2xl">
              {{ confirmService.state()?.type === 'danger' ? 'warning_amber' : (confirmService.state()?.type === 'warning' ? 'help_outline' : 'info') }}
            </span>
          </div>

          <div class="space-y-1">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {{ confirmService.state()?.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {{ confirmService.state()?.message }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button (click)="confirmService.handleCancel()"
                  class="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
            {{ confirmService.state()?.cancelText || 'Cancel' }}
          </button>
          
          <button (click)="confirmService.handleConfirm()"
                  [ngClass]="{
                    'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25': confirmService.state()?.type === 'danger',
                    'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25': confirmService.state()?.type === 'warning',
                    'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25': confirmService.state()?.type === 'info'
                  }"
                  class="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg transition-all cursor-pointer">
            {{ confirmService.state()?.confirmText || 'Confirm' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class ConfirmModalComponent {
  confirmService = inject(ConfirmDialogService);
}
