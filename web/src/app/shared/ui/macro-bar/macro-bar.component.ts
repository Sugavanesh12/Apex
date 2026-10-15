import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-macro-bar',
  standalone: true,
  template: `
    <div class="macro-item">
      <div class="macro-header">
        <span class="macro-label">
          <span class="macro-dot" [style.background-color]="color()"></span>
          {{ label() }}
        </span>
        <span class="macro-val tabular">
          <strong>{{ current() }}</strong> / {{ target() }}{{ unit() }}
        </span>
      </div>
      <div class="progress-bar-bg" [style.height.px]="height()">
        <div
          class="progress-bar-fill"
          [style.width.%]="percent()"
          [style.background-color]="color()"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .macro-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .macro-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--fs-xs);
    }
    .macro-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .macro-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .macro-val {
      color: var(--text-muted);
    }
    .macro-val strong {
      color: var(--text);
      font-weight: 600;
    }
  `]
})
export class MacroBarComponent {
  label = input.required<string>();
  current = input.required<number>();
  target = input.required<number>();
  unit = input<string>('g');
  color = input<string>('var(--primary)');
  height = input<number>(6);

  percent = computed(() => {
    const t = this.target();
    if (!t) return 0;
    return Math.min(100, Math.round((this.current() / t) * 100));
  });
}
