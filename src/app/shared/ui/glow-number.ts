import { Component, computed, inject, input } from '@angular/core';
import { I18n } from '../../core/i18n';
import { InView } from '../directives/in-view';

/** Число, що проявляється з розмиття з м’яким бірюзовим світінням (без «накручування») */
@Component({
  selector: 'app-glow-number',
  hostDirectives: [{ directive: InView, inputs: ['appInView', 'inViewInstant'] }],
  host: { class: 'glow-number' },
  template: `<span class="glow-number-value">{{ formatted() }}<span class="hl">{{ suffix() }}</span></span>`,
})
export class GlowNumber {
  readonly value = input.required<number>();
  readonly suffix = input('');
  private readonly locale = inject(I18n).t.locale;
  protected readonly formatted = computed(() => this.value().toLocaleString(this.locale).replace(/\s/g, '\u00a0'));
}
