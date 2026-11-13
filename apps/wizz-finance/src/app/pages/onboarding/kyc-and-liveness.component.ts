import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WizzPlatformStore } from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import { ToastService, UiButtonComponent, UiInputComponent, UiModalComponent, WizzIconComponent } from '@wizz/ui';

@Component({
  selector: 'app-kyc-page',
  standalone: true,
  imports: [AppShellComponent, UiButtonComponent, UiInputComponent, UiModalComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="kyc-stack">
        <h1>Verify Identity Document</h1>
        <p class="sub">Select your document type and upload front &amp; back photos.</p>
        <wizz-input label="Country" [(value)]="country" />
        <wizz-input label="Document Type" [(value)]="docType" />
        <div class="upload-grid"><div class="upload-box"><span>Front</span><input type="file" /></div><div class="upload-box"><span>Back</span><input type="file" /></div></div>
        <wizz-button [fullWidth]="true" (clicked)="submitKyc()">Submit Document</wizz-button>
      </div>
    </wizz-app-shell>
    <wizz-modal [open]="showUnderVerification()" tone="info" title="Under Verification" subtitle="Your document is being reviewed. We'll notify you soon." (closed)="showUnderVerification.set(false)">
      <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="showUnderVerification.set(false)">Got It</wizz-button></div>
    </wizz-modal>
  `,
  styles: [
    `
      .kyc-stack { display: flex; flex-direction: column; gap: 16px; max-width: 500px; }
      .kyc-stack h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .upload-box { border: 1px dashed var(--wizz-border); border-radius: 10px; padding: 20px; text-align: center; font-size: 0.8rem; cursor: pointer; }
    `,
  ],
})
export class KycPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly country = signal('United States');
  readonly docType = signal('Passport');
  readonly showUnderVerification = signal(false);
  submitKyc(): void {
    this.showUnderVerification.set(true);
    this.toast.show('Document submitted for review', 'success');
  }
}

@Component({
  selector: 'app-liveness-page',
  standalone: true,
  imports: [AppShellComponent, UiButtonComponent, UiModalComponent, WizzIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="liveness-stack">
        <h1>Take a Selfie</h1>
        <p class="sub">Position your face within the frame and blink once.</p>
        <div class="camera-preview"><wizz-icon name="camera" [size]="64" /><span>Camera Preview Placeholder</span></div>
        <wizz-button [fullWidth]="true" (clicked)="captureSelfie()">Capture Selfie</wizz-button>
      </div>
    </wizz-app-shell>
    <wizz-modal [open]="showProcessing()" tone="info" title="Processing Liveness Check" subtitle="Analyzing your selfie. Please wait..." (closed)="showProcessing.set(false)">
      <div class="processing-stack"><wizz-icon name="loader" [size]="32" /><span>Processing...</span></div>
      <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="showProcessing.set(false)">Cancel</wizz-button></div>
    </wizz-modal>
    <wizz-modal [open]="showSuccess()" tone="success" title="Liveness Check Successful!" subtitle="Your identity is now verified." (closed)="showSuccess.set(false)">
      <div drawer-footer><wizz-button [fullWidth]="true" (clicked)="showSuccess.set(false); go('/dashboard')">Go to Dashboard</wizz-button></div>
    </wizz-modal>
  `,
  styles: [
    `
      .liveness-stack { display: flex; flex-direction: column; gap: 16px; max-width: 500px; }
      .liveness-stack h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .sub { margin: 4px 0 0; font-size: 0.84rem; color: var(--wizz-text-secondary); }
      .camera-preview { width: 100%; height: 300px; border-radius: 14px; background: #111218; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; gap: 10px; }
      .processing-stack { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; }
    `,
  ],
})
export class LivenessPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly showProcessing = signal(false);
  readonly showSuccess = signal(false);
  captureSelfie(): void {
    this.showProcessing.set(true);
    setTimeout(() => {
      this.showProcessing.set(false);
      this.showSuccess.set(true);
    }, 500);
  }
  go(path: string): void { this.router.navigate([path]); }
}
