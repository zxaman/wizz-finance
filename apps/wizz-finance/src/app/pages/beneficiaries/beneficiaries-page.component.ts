import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BeneficiaryItem, WizzPlatformStore } from '@wizz/remittance-data-access';
import { AppShellComponent } from '@wizz/remittance-shell';
import {
  SelectOption,
  StepItem,
  ToastService,
  UiAccordionComponent,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiEmptyStateComponent,
  UiInputComponent,
  UiModalComponent,
  UiPhoneInputComponent,
  UiSelectComponent,
  UiStepperComponent,
  WizzIconComponent,
} from '@wizz/ui';
import { COUNTRIES, getInitials, maskAccountNumber } from '@wizz/utils';

type BeneficiaryModal =
  | null
  | 'duplicate'
  | 'leave-unsaved'
  | 'confirm-remove'
  | 'pending-transfer'
  | 'not-found';

@Component({
  selector: 'app-beneficiaries-page',
  standalone: true,
  imports: [
    FormsModule,
    AppShellComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiPhoneInputComponent,
    UiStepperComponent,
    UiAccordionComponent,
    UiDrawerComponent,
    UiModalComponent,
    UiEmptyStateComponent,
    WizzIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wizz-app-shell>
      <div class="ben-header">
        <div class="ben-title-search">
          <h1>Beneficiaries</h1>
          @if (store.beneficiaries().length > 0 && !simulateEmptyState()) {
            <div class="search-filter-group">
              <div class="search-box">
                <input
                  type="text"
                  placeholder="Search beneficiaries"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                />
                <wizz-icon name="search" [size]="16" />
              </div>
              <button
                type="button"
                class="filter-trigger"
                [class.filter-trigger--active]="activeFilterCount() > 0"
                (click)="showFilterDrawer.set(true)"
                aria-label="Filter beneficiaries"
              >
                <wizz-icon name="sliders" [size]="16" />
                @if (activeFilterCount() > 0) {
                  <span class="filter-count">{{ activeFilterCount() }}</span>
                }
              </button>
            </div>
          }
        </div>

        <div class="ben-head-actions">
          <button
            type="button"
            class="empty-toggle-chip"
            (click)="simulateEmptyState.update(v => !v)"
          >
            {{ simulateEmptyState() ? 'Show Populated List' : 'Preview Empty State (14)' }}
          </button>
          <wizz-button leadingIcon="plus" (clicked)="openAddDrawer(0)">
            Add Beneficiary
          </wizz-button>
        </div>
      </div>

      @if (store.beneficiaries().length === 0 || simulateEmptyState()) {
        <div class="empty-panel">
          <wizz-empty-state
            icon="id-card"
            title="No Beneficiaries Yet"
            description="Start by adding a beneficiary to easily send or schedule payments anytime."
          >
            <wizz-button leadingIcon="plus" (clicked)="simulateEmptyState.set(false); openAddDrawer(0)">
              Add Beneficiary
            </wizz-button>
          </wizz-empty-state>
        </div>
      } @else if (filteredBeneficiaries().length === 0) {
        <div class="empty-panel">
          <wizz-empty-state
            icon="search"
            title="No Search Results Found"
            [description]="'We didn\\'t find any beneficiary matching \"' + searchQuery() + '\" or active filters.'"
          >
            <wizz-button size="sm" (clicked)="clearAllFilters()">Clear Search/Filters</wizz-button>
          </wizz-empty-state>
        </div>
      } @else {
        <div class="ben-grid">
          @for (ben of filteredBeneficiaries(); track ben.id) {
            <article class="ben-card" (click)="openDetails(ben)">
              <div class="ben-card-top">
                <div class="ben-ident">
                  <span class="ben-avatar">{{ initials(ben.firstName + ' ' + ben.lastName) }}</span>
                  <strong>{{ ben.firstName }} {{ ben.lastName }}</strong>
                </div>
                <span class="masked-acc">{{ maskCompact(ben.bank.accountNumber) }}</span>
              </div>
              <div class="ben-card-meta">
                <div class="meta-row">
                  <span>Type</span>
                  <strong>{{ ben.type }}</strong>
                </div>
                <div class="meta-row">
                  <span>Relationship</span>
                  <strong>{{ ben.relationship }}</strong>
                </div>
              </div>
            </article>
          }
        </div>
      </div>

      <wizz-drawer
        [open]="showAddDrawer()"
        [title]="reviewMode() ? 'Is Everything Correct?' : 'Add Beneficiary'"
        [subtitle]="reviewMode() ? 'You can go back and re-enter details if anything looks off.' : ''"
        [width]="520"
        (closed)="attemptCloseAddDrawer()"
      >
        @if (!reviewMode()) {
          <wizz-stepper [steps]="wizardSteps" [activeIndex]="wizardStep()" />
          @switch (wizardStep()) {
            @case (0) {
              <div class="drawer-stack">
                <span class="sec-label">SELECT BENEFICIARY TYPE</span>
                <div class="ben-type-selector">
                  <label class="radio-card radio-card--selected">
                    <span><wizz-icon name="user" [size]="15" /> Individual</span>
                    <input type="radio" checked readonly />
                  </label>
                  <div class="radio-card radio-card--disabled">
                    <span><wizz-icon name="building-2" [size]="15" /> Organisation</span>
                    <wizz-badge tone="coming-soon">Coming Soon</wizz-badge>
                  </div>
                </div>
                <wizz-input label="First Name" placeholder="Jessica" [(value)]="firstName" />
                <div class="two-col">
                  <wizz-input label="Middle Name" placeholder="Enter Middle Name" [(value)]="middleName" />
                  <wizz-input label="Last Name" placeholder="Thompson" [(value)]="lastName" />
                </div>
                <wizz-input label="Beneficiary Email" type="email" placeholder="jess@gmail.com" [(value)]="email" />
                <wizz-phone-input label="Beneficiary's Phone Number" [(dialCode)]="dialCode" [(phone)]="phone" />
                <div class="two-col">
                  <wizz-input label="Date Of Birth" type="date" [(value)]="dob" />
                  <wizz-select label="Gender" [options]="genderOptions" [(value)]="gender" />
                </div>
                <div class="two-col">
                  <wizz-select label="Nationality" [options]="countryOptions" [(value)]="nationality" />
                  <wizz-input label="Occupation" placeholder="Enter Occupation" [(value)]="occupation" />
                </div>
                <div class="two-col">
                  <wizz-select label="Place of Birth" [options]="countryOptions" [(value)]="placeOfBirth" />
                  <wizz-select label="Relationship" [options]="relationOptions" [(value)]="relationship" />
                </div>
                <span class="sec-label">IDENTITY DOCUMENT (OPTIONAL)</span>
                <wizz-input label="Document Number" placeholder="818726261999" [(value)]="docNumber" />
                <wizz-select label="Document Type" [options]="docTypeOptions" [(value)]="docType" />
                <wizz-select label="Country Issued" [options]="countryOptions" [(value)]="docCountry" />
                <div class="two-col">
                  <wizz-input label="Issued Date" type="date" [(value)]="docIssued" />
                  <wizz-input label="Expiration Date" type="date" [(value)]="docExpiry" />
                </div>
              </div>
            }
            @case (1) {
              <div class="drawer-stack">
                <wizz-select label="Country" [options]="countryOptions" [(value)]="addrCountry" />
                <wizz-input label="Address Line 1" placeholder="Enter street address" [(value)]="addrLine1" />
                <wizz-input label="Address Line 2" placeholder="Apt, suite, unit, building, floor, etc." [(value)]="addrLine2" />
                <wizz-input label="Zip Code" placeholder="Enter ZIP" [(value)]="addrZip" />
                <div class="two-col">
                  <wizz-input label="City" placeholder="Enter city" [(value)]="addrCity" />
                  <wizz-input label="State" placeholder="Enter state" [(value)]="addrState" />
                </div>
              </div>
            }
            @case (2) {
              <div class="drawer-stack">
                <wizz-select label="Bank Name" [options]="bankOptions" [(value)]="bankName" />
                <wizz-input label="Account Holder Name" placeholder="Enter name on account" [(value)]="accountHolderName" [error]="holderError()" />
                <wizz-input label="Bank Account Number" placeholder="Enter bank account number" [(value)]="accountNumber" />
                <wizz-input label="Routing Number" placeholder="Enter routing number" [(value)]="routingNumber" />
                <wizz-select label="Account Type" [options]="accountTypeOptions" [(value)]="accountType" />
              </div>
            }
          }
        } @else {
          <div class="drawer-stack">
            <div class="review-person-chip">
              <span class="ben-avatar">{{ initials(firstName() + ' ' + lastName()) }}</span>
              <div>
                <strong>{{ firstName() }} {{ lastName() }}</strong>
                <small>{{ relationship() }}</small>
              </div>
            </div>
            <wizz-accordion title="BENEFICIARY PERSONAL DETAILS">
              <div class="detail-grid">
                <div><small>Email</small><strong>{{ email() }}</strong></div>
                <div><small>Phone</small><strong>{{ dialCode() }} {{ phone() }}</strong></div>
                <div><small>Nationality</small><strong>{{ nationality() }}</strong></div>
                <div><small>Date of Birth</small><strong>{{ dob() }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="IDENTITY DOCUMENT">
              <div class="detail-grid">
                <div><small>Document Type</small><strong>{{ docType() || 'N/A' }}</strong></div>
                <div><small>Document Number</small><strong>{{ docNumber() || 'N/A' }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="BENEFICIARY ADDRESS">
              <div class="detail-grid">
                <div><small>Street</small><strong>{{ addrLine1() }}</strong></div>
                <div><small>City / State</small><strong>{{ addrCity() }}, {{ addrState() }} {{ addrZip() }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="BENEFICIARY BANK DETAILS" [expanded]="true">
              <div class="detail-grid">
                <div><small>Bank Name</small><strong>{{ bankName() }}</strong></div>
                <div><small>Account Holder Name</small><strong>{{ accountHolderName() }}</strong></div>
                <div>
                  <small>Bank Account Number</small>
                  <strong class="inline-eye">
                    {{ showRawAccount() ? accountNumber() : maskGrouped(accountNumber()) }}
                    <button type="button" class="eye-mini" (click)="showRawAccount.update(v => !v)">
                      <wizz-icon [name]="showRawAccount() ? 'eye-off' : 'eye'" [size]="14" />
                    </button>
                  </strong>
                </div>
                <div><small>Routing Number</small><strong>{{ routingNumber() }}</strong></div>
                <div><small>Account Type</small><strong>{{ accountType() }}</strong></div>
              </div>
            </wizz-accordion>
          </div>
        }

        <div drawer-footer class="drawer-footer-row">
          @if (!reviewMode()) {
            @if (wizardStep() > 0) {
              <button type="button" class="circle-back" (click)="wizardStep.update(s => s - 1)">
                <wizz-icon name="chevron-left" [size]="18" />
              </button>
            }
            <wizz-button class="ml-auto" (clicked)="advanceWizard()">
              {{ wizardStep() < 2 ? 'Save and Next' : 'Save and Submit' }}
            </wizz-button>
          } @else {
            <wizz-button variant="outline" [fullWidth]="true" (clicked)="reviewMode.set(false)">
              Re-Enter Details
            </wizz-button>
            <wizz-button [fullWidth]="true" (clicked)="confirmCreateBeneficiary()">
              Verify and Add Beneficiary
            </wizz-button>
          }
        </div>
      </wizz-drawer>

      <wizz-drawer
        [open]="!!selectedBeneficiary()"
        title="Beneficiary Details"
        [width]="500"
        (closed)="selectedBeneficiary.set(null)"
      >
        @if (selectedBeneficiary(); as ben) {
          <div class="drawer-stack">
            <div class="details-top-row">
              <div class="review-person-chip">
                <span class="ben-avatar">{{ initials(ben.firstName + ' ' + ben.lastName) }}</span>
                <div>
                  <strong>{{ ben.firstName }} {{ ben.lastName }}</strong>
                  <small>{{ ben.type }} · {{ ben.relationship }}</small>
                </div>
              </div>
              <button type="button" class="wizz-link edit-btn" (click)="editExisting(ben)">
                <wizz-icon name="pencil" [size]="13" /> Edit
              </button>
            </div>
            <wizz-accordion title="BENEFICIARY PERSONAL DETAILS">
              <div class="detail-grid">
                <div><small>Email</small><strong>{{ ben.email }}</strong></div>
                <div><small>Phone</small><strong>{{ ben.dialCode }} {{ ben.phone }}</strong></div>
                <div><small>Nationality</small><strong>{{ ben.nationality }}</strong></div>
                <div><small>Occupation</small><strong>{{ ben.occupation }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="IDENTITY DOCUMENT">
              <div class="detail-grid">
                <div><small>Type</small><strong>{{ ben.documentType || 'National ID Card' }}</strong></div>
                <div><small>Number</small><strong>{{ ben.documentNumber || 'Provided on file' }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="BENEFICIARY ADDRESS">
              <div class="detail-grid">
                <div><small>Street</small><strong>{{ ben.address.line1 }}</strong></div>
                <div><small>City / State</small><strong>{{ ben.address.city }}, {{ ben.address.state }} {{ ben.address.zipCode }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="BENEFICIARY BANK DETAILS" [expanded]="true">
              <div class="detail-grid">
                <div><small>Bank Name</small><strong>{{ ben.bank.bankName }}</strong></div>
                <div><small>Account Holder Name</small><strong>{{ ben.bank.accountHolderName }}</strong></div>
                <div>
                  <small>Bank Account Number</small>
                  <strong class="inline-eye">
                    {{ showRawAccount() ? ben.bank.accountNumber : maskGrouped(ben.bank.accountNumber) }}
                    <button type="button" class="eye-mini" (click)="showRawAccount.update(v => !v)">
                      <wizz-icon [name]="showRawAccount() ? 'eye-off' : 'eye'" [size]="14" />
                    </button>
                  </strong>
                </div>
                <div><small>Routing Number</small><strong>{{ ben.bank.routingNumber }}</strong></div>
                <div><small>Account Type</small><strong>{{ ben.bank.accountType }}</strong></div>
              </div>
            </wizz-accordion>
          </div>
        </div>

        <div drawer-footer class="drawer-footer-row">
          @if (!reviewMode()) {
            @if (wizardStep() > 0) {
              <button type="button" class="circle-back" (click)="wizardStep.update(s => s - 1)">
                <wizz-icon name="chevron-left" [size]="18" />
              </button>
            }
            <wizz-button class="ml-auto" (clicked)="advanceWizard()">
              {{ wizardStep() < 2 ? 'Save and Next' : 'Save and Submit' }}
            </wizz-button>
          } @else {
            <wizz-button variant="outline" [fullWidth]="true" (clicked)="reviewMode.set(false)">
              Re-Enter Details
            </wizz-button>
            <wizz-button [fullWidth]="true" (clicked)="confirmCreateBeneficiary()">
              Verify and Add Beneficiary
            </wizz-button>
          }
        </div>
      </wizz-drawer>

      <wizz-drawer
        [open]="!!selectedBeneficiary()"
        title="Beneficiary Details"
        [width]="500"
        (closed)="selectedBeneficiary.set(null)"
      >
        @if (selectedBeneficiary(); as ben) {
          <div class="drawer-stack">
            <div class="details-top-row">
              <div class="review-person-chip">
                <span class="ben-avatar">{{ initials(ben.firstName + ' ' + ben.lastName) }}</span>
                <div>
                  <strong>{{ ben.firstName }} {{ ben.lastName }}</strong>
                  <small>{{ ben.type }} · {{ ben.relationship }}</small>
                </div>
              </div>
              <button type="button" class="wizz-link edit-btn" (click)="editExisting(ben)">
                <wizz-icon name="pencil" [size]="13" /> Edit
              </button>
            </div>
            <wizz-accordion title="BENEFICIARY PERSONAL DETAILS">
              <div class="detail-grid">
                <div><small>Email</small><strong>{{ ben.email }}</strong></div>
                <div><small>Phone</small><strong>{{ ben.dialCode }} {{ ben.phone }}</strong></div>
                <div><small>Nationality</small><strong>{{ ben.nationality }}</strong></div>
                <div><small>Occupation</small><strong>{{ ben.occupation }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="IDENTITY DOCUMENT">
              <div class="detail-grid">
                <div><small>Type</small><strong>{{ ben.documentType || 'National ID Card' }}</strong></div>
                <div><small>Number</small><strong>{{ ben.documentNumber || 'Provided on file' }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="BENEFICIARY ADDRESS">
              <div class="detail-grid">
                <div><small>Street</small><strong>{{ ben.address.line1 }}</strong></div>
                <div><small>City / State</small><strong>{{ ben.address.city }}, {{ ben.address.state }} {{ ben.address.zipCode }}</strong></div>
              </div>
            </wizz-accordion>
            <wizz-accordion title="BENEFICIARY BANK DETAILS" [expanded]="true">
              <div class="detail-grid">
                <div><small>Bank Name</small><strong>{{ ben.bank.bankName }}</strong></div>
                <div><small>Account Holder Name</small><strong>{{ ben.bank.accountHolderName }}</strong></div>
                <div>
                  <small>Bank Account Number</small>
                  <strong class="inline-eye">
                    {{ showRawAccount() ? ben.bank.accountNumber : maskGrouped(ben.bank.accountNumber) }}
                    <button type="button" class="eye-mini" (click)="showRawAccount.update(v => !v)">
                      <wizz-icon [name]="showRawAccount() ? 'eye-off' : 'eye'" [size]="14" />
                    </button>
                  </strong>
                </div>
                <div><small>Routing Number</small><strong>{{ ben.bank.routingNumber }}</strong></div>
                <div><small>Account Type</small><strong>{{ ben.bank.accountType }}</strong></div>
              </div>
            </wizz-accordion>
          </div>
        </div>

        <div drawer-footer class="drawer-footer-two">
          <wizz-button variant="danger-outline" [fullWidth]="true" (clicked)="activeModal.set('confirm-remove')">
            Remove Beneficiary
          </wizz-button>
          <wizz-button [fullWidth]="true" (clicked)="payBeneficiary()">
            Make a Payment
          </wizz-button>
        </div>
      </wizz-drawer>

      <wizz-drawer
        [open]="showFilterDrawer()"
        title="Apply Filters"
        [width]="500"
        (closed)="showFilterDrawer.set(false)"
      >
        <div class="filter-split">
          <div class="filter-cats">
            <button type="button" class="cat-tab" [class.cat-tab--active]="filterTab() === 'date'" (click)="filterTab.set('date')">
              <span>Date Added</span>
              @if (selectedDates().length > 0) { <span class="cnt">{{ selectedDates().length }}</span> }
            </button>
            <button type="button" class="cat-tab" [class.cat-tab--active]="filterTab() === 'type'" (click)="filterTab.set('type')">
              <span>Type</span>
              @if (selectedTypes().length > 0) { <span class="cnt">{{ selectedTypes().length }}</span> }
            </button>
            <button type="button" class="cat-tab" [class.cat-tab--active]="filterTab() === 'relation'" (click)="filterTab.set('relation')">
              <span>Relation</span>
              @if (selectedRelations().length > 0) { <span class="cnt">{{ selectedRelations().length }}</span> }
            </button>
          </div>
          <div class="filter-values">
            @switch (filterTab()) {
              @case ('date') {
                @for (d of dateBuckets; track d) {
                  <label class="chk-row">
                    <input type="checkbox" [checked]="selectedDates().includes(d)" (change)="toggleArraySignal(selectedDates, d)" />
                    <span>{{ d }}</span>
                  </label>
                }
              }
              @case ('type') {
                @for (t of ['Individual', 'Business']; track t) {
                  <label class="chk-row">
                    <input type="checkbox" [checked]="selectedTypes().includes(t)" (change)="toggleArraySignal(selectedTypes, t)" />
                    <span>{{ t }}</span>
                  </label>
                }
              }
              @case ('relation') {
                @for (r of ['Family', 'Corporate', 'Friend', 'Client']; track r) {
                  <label class="chk-row">
                    <input type="checkbox" [checked]="selectedRelations().includes(r)" (change)="toggleArraySignal(selectedRelations, r)" />
                    <span>{{ r }}</span>
                  </label>
                }
              }
            }
          </div>
        </div>
        <div drawer-footer class="drawer-footer-two">
          <wizz-button variant="outline" [fullWidth]="true" (clicked)="clearAllFilters()">
            Remove all Filters
          </wizz-button>
          <wizz-button [fullWidth]="true" (clicked)="showFilterDrawer.set(false)">
            Apply {{ activeFilterCount() || '' }} Filters
          </wizz-button>
        </div>
      </wizz-drawer>

      <wizz-modal [open]="activeModal() === 'duplicate'" tone="warning" title="Beneficiary already exists?" subtitle="The information of beneficiary already exists. Try adding different beneficiary." (closed)="activeModal.set(null)">
        <div drawer-footer>
          <wizz-button variant="outline" [fullWidth]="true" (clicked)="activeModal.set(null)">Add Another Beneficiary</wizz-button>
          <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Go Back</wizz-button>
        </div>
      </wizz-modal>

      <wizz-modal [open]="activeModal() === 'leave-unsaved'" tone="warning" title="Leave without saving?" subtitle="Any information you've entered will be lost. Do you want to discard this beneficiary?" (closed)="activeModal.set(null)">
        <div drawer-footer>
          <wizz-button variant="outline" [fullWidth]="true" (clicked)="forceCloseAddDrawer()">Leave Anyway</wizz-button>
          <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Continue Adding</wizz-button>
        </div>
      </wizz-modal>

      <wizz-modal [open]="activeModal() === 'confirm-remove'" tone="warning" title="Remove this beneficiary?" subtitle="Removing this beneficiary will permanently delete saved payout details. You can add them again anytime." (closed)="activeModal.set(null)">
        <div drawer-footer>
          <wizz-button variant="danger-outline" [fullWidth]="true" (clicked)="executeRemoveBeneficiary(false)">Remove</wizz-button>
          <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Keep Beneficiary</wizz-button>
        </div>
      </wizz-modal>

      <wizz-modal [open]="activeModal() === 'pending-transfer'" tone="warning" title="You Must Pause or Cancel the Beneficiary's Live Transfer Services" subtitle="This beneficiary currently has an in-transit or scheduled remittance. Cancel or complete the transfer before removing." (closed)="activeModal.set(null)">
        <div drawer-footer>
          <wizz-button variant="danger-outline" [fullWidth]="true" (clicked)="executeRemoveBeneficiary(true)">Force Remove</wizz-button>
          <wizz-button [fullWidth]="true" (clicked)="activeModal.set(null)">Got It</wizz-button>
        </div>
      </wizz-modal>
    </wizz-app-shell>
  `,
  styles: [
    `
      .ben-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; }
      .ben-title-search { display: flex; align-items: center; flex-wrap: wrap; gap: 18px; }
      .ben-title-search h1 { margin: 0; font-size: 1.45rem; font-weight: 800; }
      .search-filter-group { display: flex; align-items: center; gap: 8px; }
      .search-box { display: flex; align-items: center; height: 40px; width: 250px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--wizz-border-strong); background: #ffffff; color: var(--wizz-text-muted); }
      .search-box input { flex: 1; border: none; outline: none; font-size: 0.82rem; }
      .filter-trigger { position: relative; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--wizz-border-strong); background: #ffffff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--wizz-text-secondary); }
      .filter-trigger--active { border-color: var(--wizz-primary); background: var(--wizz-primary-soft); color: var(--wizz-primary); }
      .filter-count { position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: var(--wizz-primary); color: #ffffff; font-size: 0.65rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
      .ben-head-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
      .empty-toggle-chip { padding: 7px 12px; border-radius: 999px; border: 1px solid var(--wizz-primary-border); background: var(--wizz-primary-soft); color: var(--wizz-primary); font-size: 0.72rem; font-weight: 600; cursor: pointer; }
      .empty-panel { padding: 40px 0; }
      .ben-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .ben-card { border: 1px solid var(--wizz-border); border-radius: 14px; padding: 16px 18px; background: #ffffff; cursor: pointer; transition: all 0.16s ease; }
      .ben-card:hover { border-color: var(--wizz-primary); box-shadow: var(--wizz-shadow-sm); transform: translateY(-2px); }
      .ben-card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #f6f7fb; margin-bottom: 12px; }
      .ben-ident { display: flex; align-items: center; gap: 9px; }
      .ben-avatar { width: 30px; height: 30px; border-radius: 50%; background: #dfe3fa; color: #4b3fd6; font-size: 0.72rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .ben-ident strong { font-size: 0.85rem; }
      .masked-acc { font-size: 0.74rem; color: var(--wizz-text-muted); }
      .ben-card-meta { display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem; }
      .meta-row { display: flex; justify-content: space-between; }
      .meta-row span { color: var(--wizz-text-muted); }
      .drawer-stack { display: flex; flex-direction: column; gap: 13px; }
      .sec-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; color: var(--wizz-text-muted); margin-top: 4px; }
      .ben-type-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .radio-card { display: flex; align-items: center; justify-content: space-between; padding: 11px 12px; border-radius: 10px; border: 1px solid var(--wizz-border); font-size: 0.8rem; font-weight: 600; }
      .radio-card span { display: inline-flex; align-items: center; gap: 6px; }
      .radio-card--selected { border-color: var(--wizz-primary); background: var(--wizz-primary-soft); }
      .radio-card--disabled { opacity: 0.65; background: var(--wizz-surface-muted); }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .drawer-footer-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .drawer-footer-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .ml-auto { margin-left: auto; }
      .circle-back { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--wizz-border-strong); background: #ffffff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
      .details-top-row { display: flex; align-items: center; justify-content: space-between; }
      .review-person-chip { display: flex; align-items: center; gap: 10px; }
      .review-person-chip strong { display: block; font-size: 0.92rem; }
      .review-person-chip small { font-size: 0.74rem; color: var(--wizz-text-muted); }
      .edit-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 0.8rem; }
      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .detail-grid small { display: block; font-size: 0.7rem; color: var(--wizz-text-muted); margin-bottom: 2px; }
      .detail-grid strong { font-size: 0.8rem; }
      .inline-eye { display: inline-flex; align-items: center; gap: 6px; }
      .eye-mini { background: none; border: none; padding: 0; cursor: pointer; color: var(--wizz-text-secondary); display: inline-flex; }
      .filter-split { display: grid; grid-template-columns: 150px 1fr; gap: 18px; min-height: 320px; }
      .filter-cats { display: flex; flex-direction: column; gap: 6px; border-right: 1px solid var(--wizz-border); padding-right: 12px; }
      .cat-tab { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; border: none; background: var(--wizz-surface-muted); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-align: left; }
      .cat-tab--active { background: var(--wizz-primary-soft); color: var(--wizz-primary); }
      .cnt { width: 18px; height: 18px; border-radius: 50%; background: var(--wizz-text); color: #ffffff; font-size: 0.66rem; display: inline-flex; align-items: center; justify-content: center; }
      .filter-values { display: flex; flex-direction: column; gap: 12px; }
      .chk-row { display: flex; align-items: center; gap: 9px; font-size: 0.84rem; cursor: pointer; }
      .chk-row input { width: 16px; height: 16px; accent-color: var(--wizz-primary); }
      @media (max-width: 640px) {
        .search-box { width: 100%; flex: 1; }
        .ben-type-selector, .two-col, .detail-grid, .drawer-footer-two { grid-template-columns: 1fr; }
        .filter-split { grid-template-columns: 1fr; }
        .filter-cats { border-right: none; padding-right: 0; border-bottom: 1px solid var(--wizz-border); padding-bottom: 12px; flex-direction: row; overflow-x: auto; }
      }
    `,
  ],
})
export class BeneficiariesPageComponent {
  protected readonly store = inject(WizzPlatformStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly initials = getInitials;
  protected readonly maskCompact = (acc: string) => maskAccountNumber(acc, 'compact');
  protected readonly maskGrouped = (acc: string) => maskAccountNumber(acc, 'grouped');

  protected readonly wizardSteps: readonly StepItem[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'address', label: 'Address' },
    { id: 'bank', label: 'Bank Details' },
  ];

  protected readonly dateBuckets = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month'] as const;
  protected readonly countryOptions: readonly SelectOption[] = COUNTRIES.map((c) => ({ value: c.name, label: c.name, prefix: c.flag }));
  protected readonly genderOptions: readonly SelectOption[] = [{ value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }, { value: 'Other', label: 'Other' }];
  protected readonly relationOptions: readonly SelectOption[] = [{ value: 'Family', label: 'Family' }, { value: 'Corporate', label: 'Corporate' }, { value: 'Friend', label: 'Friend' }, { value: 'Client', label: 'Client' }];
  protected readonly docTypeOptions: readonly SelectOption[] = [{ value: 'National ID Card', label: 'National ID Card' }, { value: 'Passport', label: 'Passport' }, { value: 'Driving License', label: 'Driving License' }];
  protected readonly bankOptions: readonly SelectOption[] = [{ value: 'First National Bank of America', label: 'First National Bank of America' }, { value: 'Chase Bank', label: 'Chase Bank' }, { value: 'Citibank', label: 'Citibank' }, { value: 'HDFC Bank', label: 'HDFC Bank' }, { value: 'Barclays UK', label: 'Barclays UK' }];
  protected readonly accountTypeOptions: readonly SelectOption[] = [{ value: 'Savings Account', label: 'Savings Account' }, { value: 'Checking Account', label: 'Checking Account' }];

  readonly simulateEmptyState = signal(false);
  readonly searchQuery = signal('');
  readonly showFilterDrawer = signal(false);
  readonly filterTab = signal<'date' | 'type' | 'relation'>('date');
  readonly selectedDates = signal<string[]>([]);
  readonly selectedTypes = signal<string[]>([]);
  readonly selectedRelations = signal<string[]>([]);

  readonly showAddDrawer = signal(false);
  readonly wizardStep = signal(0);
  readonly reviewMode = signal(false);
  readonly showRawAccount = signal(false);
  readonly selectedBeneficiary = signal<BeneficiaryItem | null>(null);
  readonly activeModal = signal<BeneficiaryModal>(null);

  readonly firstName = signal('Jessica');
  readonly middleName = signal('');
  readonly lastName = signal('Thompson');
  readonly email = signal('jess.thompson@gmail.com');
  readonly dialCode = signal('+1');
  readonly phone = signal('9129182773');
  readonly dob = signal('2000-12-20');
  readonly gender = signal('Female');
  readonly nationality = signal('United States');
  readonly occupation = signal('Architect');
  readonly placeOfBirth = signal('United States');
  readonly relationship = signal<BeneficiaryItem['relationship']>('Family');
  readonly docNumber = signal('818726261999');
  readonly docType = signal('National ID Card');
  readonly docCountry = signal('United States');
  readonly docIssued = signal('2020-06-26');
  readonly docExpiry = signal('2030-06-25');
  readonly addrCountry = signal('United States');
  readonly addrLine1 = signal('425 Market Street');
  readonly addrLine2 = signal('Apt 14C');
  readonly addrZip = signal('94105');
  readonly addrCity = signal('San Francisco');
  readonly addrState = signal('California');
  readonly bankName = signal('First National Bank of America');
  readonly accountHolderName = signal('Jessica Thompson');
  readonly accountNumber = signal('814500999088');
  readonly routingNumber = signal('8826340012');
  readonly accountType = signal<'Savings Account' | 'Checking Account'>('Savings Account');
  readonly holderError = signal('');

  readonly activeFilterCount = computed(() => this.selectedDates().length + this.selectedTypes().length + this.selectedRelations().length);
  readonly filteredBeneficiaries = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const dates = this.selectedDates();
    const types = this.selectedTypes();
    const rels = this.selectedRelations();
    return this.store.beneficiaries().filter(b => {
      const full = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (q && !full.includes(q) && !b.email.toLowerCase().includes(q)) return false;
      if (dates.length > 0 && !dates.includes(b.dateAddedBucket)) return false;
      if (types.length > 0 && !types.includes(b.type)) return false;
      if (rels.length > 0 && !rels.includes(b.relationship)) return false;
      return true;
    });
  });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const action = params.get('action');
      if (action === 'add') this.openAddDrawer(0);
      else if (action === 'add-bank') this.openAddDrawer(2);
      else if (action === 'details') {
        const first = this.store.beneficiaries()[0];
        if (first) this.selectedBeneficiary.set(first);
      }
    });
  }

  toggleArraySignal(target: ReturnType<typeof signal<string[]>>, item: string): void {
    target.update(arr => arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedDates.set([]);
    this.selectedTypes.set([]);
    this.selectedRelations.set([]);
  }

  openAddDrawer(step = 0): void {
    this.reviewMode.set(false);
    this.wizardStep.set(step);
    this.holderError.set('');
    this.showAddDrawer.set(true);
  }

  attemptCloseAddDrawer(): void {
    this.activeModal.set('leave-unsaved');
  }

  forceCloseAddDrawer(): void {
    this.activeModal.set(null);
    this.showAddDrawer.set(false);
  }

  advanceWizard(): void {
    if (this.wizardStep() < 2) {
      this.wizardStep.update(s => s + 1);
      return;
    }
    if (!this.accountHolderName().trim()) {
      this.holderError.set('Account holder name must match');
      return;
    }
    const dup = this.store.beneficiaries().some(b => b.bank.accountNumber === this.accountNumber().trim());
    if (dup) {
      this.activeModal.set('duplicate');
      return;
    }
    this.reviewMode.set(true);
  }

  confirmCreateBeneficiary(): void {
    this.store.addBeneficiary({
      type: 'Individual',
      firstName: this.firstName().trim(),
      middleName: this.middleName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      dialCode: this.dialCode(),
      phone: this.phone().trim(),
      dob: this.dob(),
      gender: this.gender(),
      nationality: this.nationality(),
      occupation: this.occupation().trim(),
      placeOfBirth: this.placeOfBirth(),
      relationship: this.relationship(),
      documentNumber: this.docNumber(),
      documentType: this.docType(),
      documentCountry: this.docCountry(),
      documentIssuedDate: this.docIssued(),
      documentExpirationDate: this.docExpiry(),
      address: {
        country: this.addrCountry(),
        line1: this.addrLine1().trim(),
        line2: this.addrLine2().trim(),
        zipCode: this.addrZip().trim(),
        city: this.addrCity().trim(),
        state: this.addrState().trim(),
      },
      bank: {
        bankName: this.bankName(),
        accountHolderName: this.accountHolderName().trim(),
        accountNumber: this.accountNumber().trim(),
        routingNumber: this.routingNumber().trim(),
        accountType: this.accountType(),
      },
    });
    this.showAddDrawer.set(false);
    this.reviewMode.set(false);
    this.toast.show('Beneficiary Added Successfully', 'success');
  }

  openDetails(ben: BeneficiaryItem): void {
    this.showRawAccount.set(false);
    this.selectedBeneficiary.set(ben);
  }

  editExisting(ben: BeneficiaryItem): void {
    this.selectedBeneficiary.set(null);
    this.firstName.set(ben.firstName);
    this.lastName.set(ben.lastName);
    this.email.set(ben.email);
    this.accountNumber.set(`${ben.bank.accountNumber.slice(0, -2)}77`);
    this.openAddDrawer(0);
  }

  executeRemoveBeneficiary(force: boolean): void {
    const ben = this.selectedBeneficiary();
    if (!ben) return;
    const res = this.store.removeBeneficiary(ben.id, force);
    if (!res.ok && res.reason === 'pending_transfer') {
      this.activeModal.set('pending-transfer');
      return;
    }
    this.activeModal.set(null);
    this.selectedBeneficiary.set(null);
    this.toast.show('Beneficiary removed successfully', 'success');
  }

  payBeneficiary(): void {
    const ben = this.selectedBeneficiary();
    if (ben) this.store.selectedBeneficiaryId.set(ben.id);
    this.selectedBeneficiary.set(null);
    this.router.navigate(['/send-money']);
  }
}
