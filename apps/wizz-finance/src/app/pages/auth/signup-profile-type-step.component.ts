import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { SignupProfileOptionComponent } from './signup-profile-option.component';

@Component({
  selector: 'app-signup-profile-type-step',
  standalone: true,
  imports: [SignupProfileOptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="profile-type-step" aria-labelledby="profile-type-title">
      <h1 id="profile-type-title">Choose Your Profile Type</h1>
      <p class="lead">
        Selecting your profile type helps us unlock the most relevant tools, documents, and
        compliance checks for you.
      </p>

      <div class="type-options">
        <app-signup-profile-option
          title="Individual"
          description="For solo professionals and anyone sending or receiving money globally"
          icon="user"
          [selected]="true"
          (selectedOption)="individualSelected.emit()"
        />
        <app-signup-profile-option
          title="Organization"
          description="Registered company or entity receiving cross-border payments"
          icon="building-2"
          badgeLabel="Coming Soon"
          [disabled]="true"
        />
      </div>

      <p class="faq-note">
        Not sure what category you fall in?
        <button type="button" class="wizz-link" (click)="faqRequested.emit()">Refer our FAQs</button>
      </p>
    </section>
  `,
  styles: [
    `
      .profile-type-step h1 { margin: 0 0 8px; font-size: 1.5rem; font-weight: 800; color: var(--wizz-text); }
      .lead { margin: 0 0 24px; font-size: .85rem; line-height: 1.55; color: var(--wizz-text-secondary); }
      .type-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
      .faq-note { margin: 0; font-size: .8rem; color: var(--wizz-text-secondary); }
      .wizz-link { color: var(--wizz-primary); font-weight: 500; cursor: pointer; background: none; border: 0; padding: 0; font: inherit; }
      .wizz-link:hover { text-decoration: underline; }
      .wizz-link:focus-visible { outline: 2px solid var(--wizz-primary); outline-offset: 3px; border-radius: 3px; }
      @media (max-width: 640px) { .type-options { grid-template-columns: 1fr; } }
    `,
  ],
})
export class SignupProfileTypeStepComponent {
  readonly individualSelected = output<void>();
  readonly faqRequested = output<void>();
}
