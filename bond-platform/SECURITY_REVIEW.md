# Security Review — Bond & Sukuk Platform

**Review type:** Source-level, pre-release review  
**Review date:** 2026-10-27  
**Branch:** `feature/bond-sukuk-demo`  
**Status:** **NOT INDEPENDENTLY AUDITED — NOT APPROVED FOR LIVE FINANCIAL OPERATIONS**

## Scope and limitations

Reviewed the platform's Express server, browser client, package manifest, README, and GitHub Actions syntax-check workflow. This was a limited source inspection, not a penetration test, dependency audit, legal/regulatory assessment, infrastructure review, or independent third-party audit. No live environment or production deployment was assessed.

## Positive controls observed

- Server refuses startup if `LIVE_ISSUANCE_ENABLED=true`, `LIVE_PAYMENTS_ENABLED=true`, `PROVIDER_ACCESS_VERIFIED=true`, or `PAYMENTS_MODE` is not `mock`.
- Health response reports live issuance/payments disabled and provider access unverified.
- Request JSON body size is capped at 10 KB.
- `helmet` is enabled, Express's `x-powered-by` header is disabled, and user-controlled offering text is HTML-escaped in the browser UI.
- Subscription endpoint records simulated activity in process memory and explicitly says no money moved.
- CI workflow's latest inspected run completed successfully; the workflow currently checks syntax only.

## Findings

### High — No authentication or authorization
All API endpoints are publicly accessible. This is acceptable only for a non-sensitive local prototype. Do not expose it as a production investor service or place real investor/account data behind these routes until authentication, authorization, session/token controls, and access logging are implemented and tested.

### High — No persistence, transaction ledger, or financial reconciliation
Portfolio and subscription data live only in process memory and disappear on restart. This is not a reliable financial record and cannot support real investment balances, subscriptions, settlement, or audit trails.

### High — No real operational or regulatory controls
Investor onboarding/KYC, AML/sanctions screening, suitability/disclosures, custody, payment processing, settlement, issuance, and reconciliation are not implemented. Applicable Malaysian legal and regulatory requirements and licensed-provider responsibilities must be independently determined before any launch.

### Medium — Content Security Policy disabled
The server config explicitly disables Helmet's Content Security Policy. Review the page's inline script/style usage, move inline code to external files or use appropriate nonces/hashes, then enable a restrictive CSP and test the UI.

### Medium — No rate limiting or abuse controls
Public API endpoints have no rate limiting, abuse detection, or request quotas. Add route-appropriate limits and operational monitoring before any hosted exposure.

### Medium — Automated tests are insufficient
CI runs `node --check server.js` only. Add automated tests for health/safe-mode behavior, valid and invalid subscription inputs, unknown offerings, boundary amounts, response schemas, and HTML escaping; add dependency vulnerability scanning and test coverage reporting.

### Low — Documentation formatting defect corrected
The README contained escaped newline sequences in its introductory section. The README has been normalized to ordinary Markdown line breaks.

## Required before production consideration

1. Keep `LIVE_ISSUANCE_ENABLED=false`, `LIVE_PAYMENTS_ENABLED=false`, `PAYMENTS_MODE=mock`, and `PROVIDER_ACCESS_VERIFIED=false`.
2. Enable and verify a restrictive CSP; add rate limiting and security-focused tests.
3. Implement reviewed identity/access controls, durable audited records, encryption/secrets management, monitoring, backups, recovery, and incident response.
4. Obtain written confirmation of applicable regulatory permissions, legal review, and provider approvals/credentials from the relevant organizations.
5. Commission an independent security audit and penetration test; remediate findings and retain the auditor's report.
6. Deploy to a staging environment first and independently verify controls before any production release decision.

## Conclusion

The source inspected is a mock-only preparation prototype. The available CI result confirms only that the configured syntax-check workflow passed; it does **not** establish security, regulatory compliance, production readiness, or an independent audit. No live financial operation should be enabled.
