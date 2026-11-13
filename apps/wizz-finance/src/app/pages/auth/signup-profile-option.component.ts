import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UiBadgeComponent, WizzIconComponent, WizzIconName } from '@wizz/ui';

/** A reusable selectable option used by onboarding/profile-type flows. */
@Component({
  selector: 'app-signup-profile-option',
  standalone: true,
  imports: [UiBadgeComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="profile-option"
      [class.profile-option--selected]="selected()"
      [class.profile-option--disabled]="disabled()"
      [disabled]="disabled()"
      [attr.aria-pressed]="selected()"
      (click)="selectedOption.emit()"
    >
      <span class="option-topline">
        <span class="option-icon" [class.option-icon--muted]="disabled()">
          <wizz-icon [name]="icon()" [size]="20" />
        </span>
        @if (badgeLabel()) {
          <wizz-badge tone="coming-soon">{{ badgeLabel() }}</wizz-badge>
        }
      </span>
      <span class="option-title">{{ title() }}</span>
      <span class="option-description">{{ description() }}</span>
    </button>
  `,
  styles: [
    `
      :host { display: block; min-width: 0; }
      .profile-option {
        width: 100%;
        min-height: 152px;
        padding: 18px 16px;
        border: 1.5px solid var(--wizz-border);
        border-radius: 14px;
        background: #fff;
        color: var(--wizz-text);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 9px;
        text-align: left;
        font: inherit;
        transition: border-color .16s ease, background .16s ease, transform .16s ease;
      }
      .profile-option:not(:disabled) { cursor: pointer; }
      .profile-option--selected { border-color: var(--wizz-primary-border); }
      .profile-option--selected:hover,
      .profile-option--selected:focus-visible {
        border-color: var(--wizz-primary);
        background: var(--wizz-primary-soft);
        transform: translateY(-2px);
      }
      .profile-option--disabled { opacity: .72; background: #fafbfe; cursor: not-allowed; }
      .option-topline { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .option-icon {
        width: 36px; height: 36px; border-radius: 10px;
        background: var(--wizz-primary-soft); color: var(--wizz-primary);
        display: inline-flex; align-items: center; justify-content: center;
      }
      .option-icon--muted { background: #eef0f6; color: var(--wizz-text-muted); }
      .option-title { font-size: .96rem; font-weight: 700; }
      .option-description { color: var(--wizz-text-secondary); font-size: .76rem; line-height: 1.45; }
      @media (max-width: 640px) {
        .profile-option { min-height: 0; }
      }
    `,
  ],
})
export class SignupProfileOptionComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input.required<WizzIconName>();
  readonly disabled = input(false);
  readonly selected = input(false);
  readonly badgeLabel = input('');
  readonly selectedOption = output<void>();
}
