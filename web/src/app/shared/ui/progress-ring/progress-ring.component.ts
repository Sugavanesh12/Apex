import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  template: `
    <div
      class="ring-container"
      [style.width.px]="size()"
      [style.height.px]="size()"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-label]="label() || 'Progress'"
    >
      <svg
        [attr.width]="size()"
        [attr.height]="size()"
        [attr.viewBox]="'0 0 ' + size() + ' ' + size()"
      >
        <!-- Background Track -->
        <circle
          class="track"
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke]="trackColor()"
        />
        <!-- Progress Indicator -->
        <circle
          class="indicator"
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="radius()"
          [attr.stroke-width]="strokeWidth()"
          [attr.stroke]="strokeColor()"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="dashOffset()"
          stroke-linecap="round"
        />
      </svg>
      <div class="ring-content">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    .ring-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      transform: rotate(-90deg);
      display: block;
    }
    circle {
      fill: none;
      transition: stroke-dashoffset 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .track {
      opacity: 0.25;
    }
    .ring-content {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
    }
  `]
})
export class ProgressRingComponent {
  value = input<number>(0);
  max = input<number>(100);
  size = input<number>(110);
  strokeWidth = input<number>(8);
  strokeColor = input<string>('var(--primary)');
  trackColor = input<string>('var(--surface-3)');
  label = input<string>('');

  center = computed(() => this.size() / 2);
  radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  circumference = computed(() => 2 * Math.PI * this.radius());

  dashOffset = computed(() => {
    const pct = Math.min(1, Math.max(0, this.value() / (this.max() || 1)));
    return this.circumference() * (1 - pct);
  });
}
