import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Responsive layout wrapper for paired or grouped form controls. */
@Component({
  selector: 'wizz-form-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="form-grid"
      [style.--form-grid-columns]="columns()"
      [style.--form-grid-gap.px]="gap()"
    >
      <ng-content />
    </div>
  `,
  styles: [
    `
      .form-grid {
        display: grid;
        grid-template-columns: repeat(var(--form-grid-columns, 2), minmax(0, 1fr));
        gap: var(--form-grid-gap, 12px);
        min-width: 0;
      }

      @media (max-width: 520px) {
        .form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ],
})
export class UiFormGridComponent {
  readonly columns = input(2);
  readonly gap = input(12);
}
