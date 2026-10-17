import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { I18n } from '../core/i18n';
import { Booking } from '../core/booking.service';
import { SmoothScroll } from '../core/smooth-scroll.service';
import { BookingForm } from '../shared/ui/booking-form';
import { Icon } from '../shared/ui/icon';

/** Модальне вікно запису на нативному <dialog>: фокус, Esc і top-layer — силами браузера */
@Component({
  selector: 'app-booking-dialog',
  imports: [BookingForm, Icon],
  template: `
    <dialog #dialog aria-labelledby="booking-title" (close)="onClose()" (click)="onBackdrop($event)">
      @if (booking.open()) {
        <div class="panel">
          <button type="button" class="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-frost bg-white hover:border-aqua" [attr.aria-label]="ui.close" (click)="dialog.close()">
            <app-icon name="close" />
          </button>
          <p class="pill"><span class="pill-dot" aria-hidden="true"></span>{{ ui.dialog.pill }}</p>
          <h2 id="booking-title" class="title-md mt-5 pr-12">{{ ui.dialog.title }}</h2>
          <p class="mt-2 text-slate">{{ ui.dialog.lead }}</p>
          <div class="mt-7">
            <!-- Форма (і @angular/forms) вантажиться лише при першому відкритті -->
            @defer (on immediate) {
              <app-booking-form [presetService]="booking.preset()" />
            } @placeholder (minimum 0ms) {
              <div class="grid h-[30rem] place-items-center text-slate" role="status">{{ ui.dialog.loading }}</div>
            }
          </div>
        </div>
      }
    </dialog>
  `,
  styles: `
    dialog {
      margin: auto auto 0; width: 100%; max-width: 100%; max-height: 94dvh; padding: 0; border: 0;
      border-radius: 2rem 2rem 0 0; background: #fff; color: inherit; overflow-y: auto; overscroll-behavior: contain;
      opacity: 0; transform: translateY(40px); filter: blur(6px);
      transition: opacity .45s var(--ease-calm), transform .55s var(--ease-calm), filter .45s, overlay .5s allow-discrete, display .5s allow-discrete;
    }
    dialog[open] { opacity: 1; transform: none; filter: none; }
    @starting-style { dialog[open] { opacity: 0; transform: translateY(40px); filter: blur(6px); } }
    dialog::backdrop { background: rgb(11 31 58 / 0.4); backdrop-filter: blur(6px); opacity: 0; transition: opacity .45s, overlay .5s allow-discrete, display .5s allow-discrete; }
    dialog[open]::backdrop { opacity: 1; }
    @starting-style { dialog[open]::backdrop { opacity: 0; } }
    .panel { position: relative; padding: 1.75rem 1.25rem 2.25rem; }
    @media (min-width: 640px) {
      dialog { margin: auto; max-width: 34rem; border-radius: 2rem; }
      .panel { padding: 2.5rem; }
    }
  `,
})
export class BookingDialog {
  protected readonly booking = inject(Booking);
  protected readonly ui = inject(I18n).t;
  private readonly scroll = inject(SmoothScroll);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.booking.open() && !el.open) {
        el.showModal();
        this.scroll.stop();
      } else if (!this.booking.open() && el.open) {
        el.close();
      }
    });
  }

  protected onClose(): void {
    this.booking.close();
    this.scroll.start();
  }

  protected onBackdrop(e: MouseEvent): void {
    if (e.target === this.dialog().nativeElement) this.dialog().nativeElement.close();
  }
}
