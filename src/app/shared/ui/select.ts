import { Component, ElementRef, computed, inject, input, model, signal, viewChild } from '@angular/core';
import { Icon } from './icon';

/** Власний select (combobox + listbox): стилізований список, клавіатура як у нативного */
@Component({
  selector: 'app-select',
  imports: [Icon],
  host: { class: 'relative block', '(document:pointerdown)': 'onOutside($event)' },
  template: `
    <button
      #trigger
      type="button"
      role="combobox"
      class="trigger"
      [id]="inputId()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="inputId() + '-list'"
      [attr.aria-activedescendant]="open() ? inputId() + '-o' + active() : null"
      (click)="toggle()"
      (keydown)="onKey($event)"
    >
      <span class="truncate">{{ value() }}</span>
      <app-icon name="chevronRight" [size]="18" class="chev text-slate" [class.up]="open()" />
    </button>
    @if (open()) {
      <ul class="list" role="listbox" [id]="inputId() + '-list'" [attr.aria-labelledby]="inputId()" tabindex="-1">
        @for (o of options(); track o; let i = $index) {
          <li
            role="option"
            [id]="inputId() + '-o' + i"
            [attr.aria-selected]="o === value()"
            [class.active]="i === active()"
            (pointerenter)="active.set(i)"
            (click)="pick(i)"
          >
            <span>{{ o }}</span>
            @if (o === value()) { <app-icon name="check" [size]="16" class="text-teal" /> }
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .trigger {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      width: 100%; min-height: 3.25rem; padding: 0 1rem 0 1.1rem; border-radius: 1rem; text-align: left;
      background: #fff; border: 1px solid var(--color-frost); color: var(--color-ink); font: inherit;
      transition: border-color .3s, box-shadow .3s;
    }
    .trigger:hover { border-color: var(--color-aqua); }
    .trigger:focus-visible, .trigger[aria-expanded='true'] { outline: none; border-color: var(--color-aqua); box-shadow: 0 0 0 4px rgb(20 184 166 / 0.15); }
    .chev { flex: none; transform: rotate(90deg); transition: transform .25s var(--ease-calm); }
    .chev.up { transform: rotate(-90deg); }
    .list {
      position: absolute; z-index: 30; left: 0; right: 0; top: calc(100% + 0.4rem);
      max-height: 16rem; overflow-y: auto; overscroll-behavior: contain; padding: 0.35rem;
      background: #fff; border: 1px solid var(--color-frost); border-radius: 1rem; box-shadow: var(--shadow-soft);
      animation: drop .18s var(--ease-calm);
    }
    li {
      display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
      padding: 0.7rem 0.85rem; border-radius: 0.7rem; cursor: pointer; font-size: 0.95rem;
    }
    li.active { background: rgb(20 184 166 / 0.09); }
    li[aria-selected='true'] { font-weight: 600; color: var(--color-teal); }
    @keyframes drop { from { opacity: 0; transform: translateY(-4px); } }
  `,
})
export class Select {
  readonly inputId = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly value = model.required<string>();

  protected readonly open = signal(false);
  protected readonly active = signal(0);
  private readonly selectedIndex = computed(() => Math.max(0, this.options().indexOf(this.value())));
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private typed = '';
  private typedAt = 0;

  protected toggle(): void {
    if (this.open()) this.open.set(false);
    else this.show();
  }

  private show(): void {
    this.active.set(this.selectedIndex());
    this.open.set(true);
    queueMicrotask(() => this.scrollActive());
  }

  protected pick(i: number): void {
    this.value.set(this.options()[i]);
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  protected onOutside(e: PointerEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.options().length;
    const move = (i: number) => {
      e.preventDefault();
      if (!this.open()) return this.show();
      this.active.set(Math.min(n - 1, Math.max(0, i)));
      this.scrollActive();
    };
    switch (e.key) {
      case 'ArrowDown': return move(this.active() + 1);
      case 'ArrowUp': return move(this.active() - 1);
      case 'Home': return move(0);
      case 'End': return move(n - 1);
      case 'Enter':
      case ' ':
        e.preventDefault();
        return this.open() ? this.pick(this.active()) : this.show();
      case 'Escape':
        if (this.open()) { e.preventDefault(); e.stopPropagation(); this.open.set(false); }
        return;
      case 'Tab':
        this.open.set(false);
        return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      this.typed = (now - this.typedAt > 700 ? '' : this.typed) + e.key.toLowerCase();
      this.typedAt = now;
      const i = this.options().findIndex((o) => o.toLowerCase().startsWith(this.typed));
      if (i >= 0) {
        if (this.open()) { this.active.set(i); this.scrollActive(); }
        else this.value.set(this.options()[i]);
      }
    }
  }

  private scrollActive(): void {
    document.getElementById(`${this.inputId()}-o${this.active()}`)?.scrollIntoView({ block: 'nearest' });
  }
}
