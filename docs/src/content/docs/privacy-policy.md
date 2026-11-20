---
title: Privacy Policy
description: Privacy Policy for Zonvoir Table and Zonvoir Table Pro. Learn how we handle information, customer accounts, billing, license repository access, cookies, and user privacy across our documentation site and software packages.
template: splash
editUrl: false
prev: false
next: false
---

<div class="zv-legal-page">

<div class="zv-legal-meta">
  <span class="zv-legal-badge">Legal &amp; Privacy</span>
  <span>Last updated: November 11, 2026</span>
  <span>Entity: Zonvoir Technologies Pvt Ltd</span>
</div>

<div class="zv-legal-summary">
  <strong>Summary for Developers:</strong> Zonvoir Table core (open-source) and Zonvoir Table Pro (commercial) run entirely within your own infrastructure — we never collect, track, or transmit your database queries, records, or application data. This policy details how our documentation website, customer licensing portal, private package repository, and commercial services handle personal data.
</div>

## 1. Package Runtime Data Privacy (Core & Pro)

Both Zonvoir Table (open-source) and Zonvoir Table Pro (commercial) are developer-facing libraries designed to run strictly within your infrastructure:

- **Local Execution:** The Laravel packages (`zonvoir/laravel-inertia-table`, `zonvoir/laravel-inertia-table-pro`) and Vue adapter (`@zonvoir/inertia-table-vue`) execute exclusively inside your application servers, containers, and your end-users' web browsers.
- **Zero Telemetry or Phone-Home:** We do not track, collect, or transmit any data processed by your tables. We have no access to your database records, Eloquent queries, application users, search parameters, or filter state.
- **Data Sovereignty:** All database queries, table configurations, and displayed data remain strictly under your control within your own hosting environment and database.

## 2. Information Collected on the Documentation Website

When you browse the documentation at [https://zonvoir-table.com](https://zonvoir-table.com) or interact with public demos:

### A. Technical and Log Data
Our hosting servers automatically record standard access logs, which include:
- Your IP address (anonymized where applicable);
- Browser type and operating system;
- Referring URL and requested documentation pages;
- Date and time of visit;
- HTTP response code and bytes transferred.

This information is used strictly to maintain website security, prevent denial-of-service attacks, and troubleshoot technical errors.

### B. Client-Side Preferences (Local Storage)
Our documentation site uses your browser's `localStorage` to save your UI preferences:
- **Theme preference:** Remembers whether you selected Light or Dark mode (`starlight-theme`).
- **Sidebar & code state:** Remembers collapsed sidebar sections or copy code states.

This data is stored purely on your local device and is never transmitted to our servers or third parties.

## 3. Information Collected for Zonvoir Table Pro Customers

When you create an account, purchase a license, or access Zonvoir Table Pro services via [https://app.zonvoir-table.com](https://app.zonvoir-table.com) or our private Composer repository:

### A. Account & Authentication Data
- **OAuth Login:** When you register or sign in via Google OAuth or GitHub OAuth, we receive your email address, name, and profile identifier from the authentication provider to verify your identity and manage your account.
- **Email & Credentials:** Your verified email address is linked to your customer profile, purchase records, and generated license keys.

### B. Billing, Invoicing & Payment Details
- **Payment Processing via Stripe:** All payment transactions are securely handled by our payment processor, Stripe. We do not store or process raw credit card numbers, CVVs, or cardholder security codes on our servers.
- **Invoicing & Tax Records:** To generate legally compliant tax invoices (including Indian GST invoices under SAC 997331 or international receipts), we collect your billing name, business entity name, billing address, and tax registration number (such as GSTIN) where applicable.

### C. Repository Access & License Verification
- When you install or update Zonvoir Table Pro using Composer, your client connects to our authenticated private Composer gateway (`satis.zonvoir-table.com`).
- To verify active license entitlements and prevent unauthorized distribution, our repository servers log:
  - The license key identifier used for HTTP Basic authentication;
  - The package name and release version requested;
  - Timestamp of the download request;
  - Client IP address and User-Agent string (Composer version).
- These logs are retained solely for license integrity verification, abuse detection, and authorized download tracking.

## 4. Cookies and Tracking Technologies

- **Essential Session Cookies:** The customer portal uses secure, HTTP-only session cookies strictly required for user authentication, CSRF security, and maintaining signed-in sessions.
- **No Advertising Cookies:** We do not display third-party advertisements or participate in ad retargeting networks.
- **No Cross-Site Tracking:** We do not track you across external third-party websites or sell user profiling data.

You can manage or disable cookies through your browser settings, though disabling session cookies will prevent signing into the customer portal.

## 5. Third-Party Service Providers

We utilize trusted third-party service providers to deliver our developer services:

- **Stripe:** For checkout, payment authorization, subscription billing, and tax calculation ([Stripe Privacy Policy](https://stripe.com/privacy)).
- **Google & GitHub OAuth:** For optional, secure single sign-on authentication.
- **Cloud Infrastructure & Hosting:** For hosting documentation, web applications, and private Composer distribution packages.
- **GitHub:** For hosting public open-source repositories and release distribution for the core package.

## 6. How We Use Information

Any personal or technical information collected is used solely to:
- Authenticate customer accounts and provide access to purchased Pro licenses;
- Deliver private package releases through our authenticated Composer repository;
- Process subscription payments, issue tax-compliant invoices, and prevent transaction fraud;
- Deliver, monitor, and protect the documentation site and developer services;
- Respond to customer support inquiries, licensing questions, and bug reports.

We do not sell, rent, trade, or monetize your personal information under any circumstances.

## 7. Data Retention & Security

We maintain administrative, technical, and physical safeguards (including mandatory HTTPS encryption, bcrypt/argon password hashing for credentials, and restricted database access) to protect customer data:

- **Billing & Invoice History:** Retained for the statutory period required by taxation and accounting regulations (such as GST laws in India).
- **License Credentials:** License identifiers and entitlement records are retained for as long as your account remains active or holds entitled historical releases.
- **Access Logs:** Repository download logs and web access logs are periodically rotated and automatically purged.

## 8. Your Data Protection Rights

Depending on your jurisdiction (including the European Economic Area under GDPR, the UK, and California under CCPA/CPRA), you may have certain rights regarding your personal information:

- **Right to Access:** You may request details of the personal data we hold about you.
- **Right to Rectification:** You may request correction of inaccurate or incomplete personal data.
- **Right to Erasure:** You may request deletion of your account and personal data, subject to statutory retention requirements for financial and tax records.
- **Right to Restrict or Object:** You may object to or request restrictions on certain processing activities.

To exercise any of these rights, please contact us using the details below.

## 9. Children's Privacy

Zonvoir Table documentation, open-source libraries, and commercial software are developer tools intended for software engineers and businesses. We do not knowingly collect personal data from individuals under the age of 16.

## 10. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect modifications to our software products, licensing portal, or applicable regulations. Any revisions will be indicated by updating the "Last updated" date at the top of this document.

## 11. Contact Us

If you have questions, feedback, or data privacy requests concerning this Privacy Policy, please reach out to us:

<div class="zv-contact-box">
  <ul>
    <li><strong>Organization:</strong> Zonvoir Technologies Pvt Ltd</li>
    <li><strong>Website:</strong> <a href="https://zonvoir.com" target="_blank" rel="noopener noreferrer">https://zonvoir.com</a></li>
    <li><strong>Documentation:</strong> <a href="https://zonvoir-table.com">https://zonvoir-table.com</a></li>
    <li><strong>Customer Portal:</strong> <a href="https://app.zonvoir-table.com" target="_blank" rel="noopener noreferrer">https://app.zonvoir-table.com</a></li>
    <li><strong>General &amp; Privacy Inquiries:</strong> <a href="mailto:info@zonvoir.com">info@zonvoir.com</a></li>
  </ul>
</div>

</div>
