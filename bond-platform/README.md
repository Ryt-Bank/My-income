# Bond & Sukuk Platform — Live Mode Preparation

A standalone responsive web/mobile-friendly investor experience in live-readiness preparation, added alongside the existing Plaid Income Sample. This is not a live securities platform.

## Current mode: Live Mode preparation (not live operations)

The interface is labelled for live readiness, but it remains a mock-only prototype. Real issuance, investor funds, payments and transfers are not enabled.

## Included
- Responsive investor dashboard with illustrative bond/sukuk offerings.
- Portfolio and activity views backed by mock in-memory data.
- Simulated subscription flow that never moves money or creates a real investment.
- Express API and health endpoint.
- Explicit safe defaults for live issuance and payments.

## Run locally
Requirements: Node.js 20+.

```bash
cd bond-platform
npm install
cp .env.example .env
npm start
```

Open http://localhost:8080. API health: http://localhost:8080/api/health.

## Safety and limitations
- `LIVE_ISSUANCE_ENABLED=false`
- `LIVE_PAYMENTS_ENABLED=false`
- `PAYMENTS_MODE=mock`
- `PROVIDER_ACCESS_VERIFIED=false`
- Simulated subscription activity is held in server memory and disappears when the process restarts.
- No investor identity verification, custody, settlement, payment processing, token minting, or real issuance is implemented.
- Example yields, amounts, and offerings are illustrative only and are not offers, investment advice, or guaranteed returns.
- A target of RM30 billion is a planning placeholder, not evidence of funding, issuance capacity, approvals, or investor commitments.

Before any real launch, obtain applicable Malaysian regulatory/legal approvals and provider access, implement audited security and persistent data storage, and engage appropriately licensed parties. Do not enable live operations merely by changing environment variables without an independently reviewed integration and approval process.

## Deployment
This folder can be deployed as a Node web service on a Node-compatible host. Set the start command to `npm start`. Keep all live flags disabled. No deployment has been performed by this commit. The UI label indicates preparation only; it does not indicate production readiness or regulatory approval.
