'use strict';

const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 8080);

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));

// Fail closed if someone tries to start this demo with live money movement enabled.
const liveIssuance = String(process.env.LIVE_ISSUANCE_ENABLED || 'false').toLowerCase() === 'true';
const livePayments = String(process.env.LIVE_PAYMENTS_ENABLED || 'false').toLowerCase() === 'true';
const providerVerified = String(process.env.PROVIDER_ACCESS_VERIFIED || 'false').toLowerCase() === 'true';
const paymentsMode = String(process.env.PAYMENTS_MODE || 'mock').toLowerCase();

if (liveIssuance || livePayments || providerVerified || paymentsMode !== 'mock') {
  console.error('Unsafe configuration: this demo requires live issuance/payments disabled, provider access unverified, and PAYMENTS_MODE=mock.');
  process.exit(1);
}

const offerings = [
  { id: 'SUKUK-2027-A', name: 'Infrastructure Sukuk I', type: 'Sukuk', issuer: 'Demo Infrastructure Berhad', currency: 'MYR', indicativeRate: 4.2, tenorMonths: 24, minimum: 1000, target: 50000000, subscribed: 18300000, risk: 'Illustrative / medium', status: 'Demo only' },
  { id: 'BOND-2028-B', name: 'Sustainable Growth Bond', type: 'Bond', issuer: 'Demo Sustainable Finance Sdn. Bhd.', currency: 'MYR', indicativeRate: 4.8, tenorMonths: 36, minimum: 5000, target: 100000000, subscribed: 42100000, risk: 'Illustrative / medium-high', status: 'Demo only' },
  { id: 'SUKUK-2029-C', name: 'Renewable Energy Sukuk', type: 'Sukuk', issuer: 'Demo Renewables Berhad', currency: 'MYR', indicativeRate: 5.1, tenorMonths: 48, minimum: 1000, target: 75000000, subscribed: 26800000, risk: 'Illustrative / medium-high', status: 'Demo only' }
];
const activity = [];
const subscriptions = [];

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  mode: 'live-preparation',
  liveOperationsEnabled: false,
  liveIssuanceEnabled: false,
  livePaymentsEnabled: false,
  providerAccessVerified: false,
  paymentsMode: 'mock'
}));

app.get('/api/offerings', (_req, res) => res.json({ mode: 'demo', data: offerings }));
app.get('/api/portfolio', (_req, res) => res.json({
  mode: 'demo',
  currency: 'MYR',
  virtualBalance: 100000,
  subscribedValue: subscriptions.reduce((sum, item) => sum + item.amount, 0),
  holdings: subscriptions.map(({ id, offeringId, amount, createdAt }) => ({ id, offeringId, amount, createdAt, status: 'SIMULATED' }))
}));
app.get('/api/activity', (_req, res) => res.json({ mode: 'demo', data: activity }));

app.post('/api/demo-subscriptions', (req, res) => {
  const offeringId = typeof req.body?.offeringId === 'string' ? req.body.offeringId : '';
  const amount = Number(req.body?.amount);
  const offering = offerings.find((item) => item.id === offeringId);

  if (!offering) return res.status(400).json({ error: 'Unknown demo offering.' });
  if (!Number.isFinite(amount) || amount < offering.minimum || amount > 1000000 || Math.round(amount * 100) !== amount * 100) {
    return res.status(400).json({ error: `Enter a valid demo amount between RM ${offering.minimum.toLocaleString('en-MY')} and RM 1,000,000, with up to 2 decimal places.` });
  }

  const item = {
    id: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    offeringId,
    amount,
    createdAt: new Date().toISOString(),
    status: 'SIMULATED — NO MONEY MOVED'
  };
  subscriptions.unshift(item);
  activity.unshift({ id: item.id, type: 'Demo subscription', description: offering.name, amount, currency: 'MYR', createdAt: item.createdAt, status: item.status });
  return res.status(201).json({ mode: 'demo', message: 'Simulation recorded in temporary memory only. No investment or payment was made.', data: item });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(port, () => console.log(`Bond & Sukuk demo listening on port ${port}; live money movement is disabled.`));
