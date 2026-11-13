import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '@wizz/remittance-shell';
import {
  BrandLogoComponent,
  UiAccordionComponent,
  UiBadgeComponent,
  UiButtonComponent,
  UiDrawerComponent,
  UiEmptyStateComponent,
  UiInputComponent,
  UiModalComponent,
  UiSelectComponent,
  UiTabsComponent,
  WizzIconComponent,
} from '@wizz/ui';

@Component({
  selector: 'app-dashboard-and-accounts-page',
  standalone: true,
  imports: [
    RouterLink,
    AppShellComponent,
    BrandLogoComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
    UiDrawerComponent,
    UiModalComponent,
    UiTabsComponent,
    UiEmptyStateComponent,
    UiAccordionComponent,
    WizzIconComponent,
  ],
  template: `
    <wizz-app-shell>
      <div class="partner-dashboard">
        <div class="dash-header">
          <h1>Partner Overview</h1>
          <wizz-brand-logo [brand]="'partner'" />
        </div>

        <wizz-tabs [tabs]="overviewTabs" [(activeTab)]="balanceTab" />

        <div class="total-balance-banner">
          <div>
            <span class="bal-caption">TOTAL PARTNER BALANCE · USD</span>
            <div class="bal-amount-row">
              <strong class="big-balance">$1,240,500.00</strong>
              <span class="growth-tag">↑ 12.4% <small>Since Last Month</small></span>
            </div>
          </div>
          <div class="bal-actions">
            <wizz-button variant="secondary" size="sm" leadingIcon="plus-circle">
              Add Funds
            </wizz-button>
            <wizz-button variant="dark" size="sm" leadingIcon="arrow-left-right">
              Transfer
            </wizz-button>
          </div>
        </div>

        <div class="recent-head">
          <h3 class="section-heading m-0">Recent Partner Transactions</h3>
          <a routerLink="/payments" class="view-all-link">View All &gt;</a>
        </div>

        <div class="table-box">
          <table class="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-11-12</td>
                <td><strong>Payout</strong></td>
                <td><span class="curr-cell">🇺🇸 USD</span></td>
                <td class="amount-cell">$45,000.00</td>
                <td><wizz-badge tone="verified">Completed</wizz-badge></td>
              </tr>
              <tr>
                <td>2026-11-10</td>
                <td><strong>Settlement</strong></td>
                <td><span class="curr-cell">🇮🇳 INR</span></td>
                <td class="amount-cell">₹37,40,000.00</td>
                <td><wizz-badge tone="pending">In Transit</wizz-badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </wizz-app-shell>
  `,
  styles: [
    `
      .partner-dashboard {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .dash-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .dash-header h1 {
        margin: 0;
        font-size: 1.45rem;
      }
      .total-balance-banner {
        padding: 24px 26px;
        border-radius: 18px;
        border: 1px solid #e2e8f0;
        background: linear-gradient(125deg, #ffffff 45%, #f8fafc 100%);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 18px;
      }
      .bal-caption {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #64748b;
      }
      .bal-amount-row {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 6px;
      }
      .big-balance {
        font-size: clamp(1.75rem, 3vw, 2.25rem);
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .growth-tag {
        font-size: 0.78rem;
        font-weight: 700;
        color: #44b767;
      }
      .growth-tag small {
        color: #64748b;
        font-weight: 500;
      }
      .bal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .recent-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .section-heading {
        margin: 0;
        font-size: 0.96rem;
        font-weight: 700;
      }
      .m-0 { margin: 0; }
      .view-all-link {
        font-size: 0.8rem;
        font-weight: 600;
        color: #7965f0;
      }
      .table-box {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        overflow-x: auto;
        background: #ffffff;
      }
      .tx-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 580px;
      }
      .tx-table th {
        text-align: left;
        padding: 13px 18px;
        background: #f8fafc;
        font-size: 0.74rem;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
      }
      .tx-table td {
        padding: 15px 18px;
        font-size: 0.83rem;
        border-bottom: 1px solid #f1f5f9;
      }
      .tx-table tbody tr:hover {
        background: #f8fafc;
      }
      .curr-cell {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .amount-cell {
        font-weight: 700;
      }
    `,
  ],
})
export class DashboardAndAccountsComponent {}
