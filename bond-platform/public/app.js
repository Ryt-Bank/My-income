'use strict';

const money = (value) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value);
const byId = (id) => document.getElementById(id);
let offerings = [];
let selectedOffering = null;
const dialog = byId('subscribe-dialog');

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

function renderOfferings() {
  byId('offering-count').textContent = offerings.length;
  byId('offerings-list').innerHTML = offerings.map((item) => {
    const pct = Math.max(0, Math.min(100, item.subscribed / item.target * 100));
    return `<article class="offer-card">
      <div class="offer-top"><span class="product-type">${escapeHtml(item.type)}</span><span class="risk">${escapeHtml(item.risk)}</span></div>
      <h3>${escapeHtml(item.name)}</h3><p class="issuer">${escapeHtml(item.issuer)}</p>
      <div class="rate-row"><div><div class="rate">${Number(item.indicativeRate).toFixed(2)}<small>% p.a.*</small></div><div class="rate-label">Indicative sample rate</div></div><div class="term">${item.tenorMonths} months<small>Illustrative tenor</small></div></div>
      <div class="progress-info"><span>Sample allocation</span><strong>${pct.toFixed(0)}%</strong></div><div class="progress"><span style="width:${pct}%"></span></div>
      <div class="target-info">${money(item.subscribed)} of ${money(item.target)} sample target</div>
      <button class="button primary" data-offering="${escapeHtml(item.id)}">Preview terms</button>
    </article>`;
  }).join('');
  document.querySelectorAll('[data-offering]').forEach((button) => button.addEventListener('click', () => openDialog(button.dataset.offering)));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function openDialog(id) {
  selectedOffering = offerings.find((item) => item.id === id);
  if (!selectedOffering) return;
  byId('dialog-title').textContent = selectedOffering.name;
  byId('dialog-description').textContent = `Minimum virtual amount: ${money(selectedOffering.minimum)}. Sample rate: ${Number(selectedOffering.indicativeRate).toFixed(2)}% p.a. This is not a real product or offer.`;
  byId('amount').min = selectedOffering.minimum;
  byId('amount').value = selectedOffering.minimum;
  byId('dialog-error').textContent = '';
  dialog.showModal();
}

byId('subscribe-form').addEventListener('submit', async (event) => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  if (!selectedOffering) return;
  const button = byId('confirm-subscription');
  button.disabled = true;
  button.textContent = 'Preparing…';
  byId('dialog-error').textContent = '';
  try {
    const result = await api('/api/demo-subscriptions', {
      method: 'POST',
      body: JSON.stringify({ offeringId: selectedOffering.id, amount: Number(byId('amount').value) })
    });
    dialog.close();
    showToast(result.message);
    await refreshPortfolio();
  } catch (error) {
    byId('dialog-error').textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = 'Preview simulation';
  }
});

async function refreshPortfolio() {
  const [portfolio, activityPayload] = await Promise.all([api('/api/portfolio'), api('/api/activity')]);
  byId('balance').textContent = money(portfolio.virtualBalance);
  byId('subscribed').textContent = money(portfolio.subscribedValue);
  const items = activityPayload.data;
  byId('activity-list').innerHTML = items.length ? items.slice(0, 8).map((item) => `<tr><td><strong>${escapeHtml(item.description)}</strong><br><span style="color:#93a0b2">${escapeHtml(item.id)}</span></td><td>${new Date(item.createdAt).toLocaleString()}</td><td>${money(item.amount)}</td><td><span class="status">SIMULATED</span></td></tr>`).join('') : '<tr><td colspan="4" class="empty">No simulated activity yet. Explore an illustrative offering above.</td></tr>';
}

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 4800);
}

async function init() {
  try {
    const result = await api('/api/offerings');
    offerings = result.data;
    renderOfferings();
    await refreshPortfolio();
  } catch (_error) {
    byId('offerings-list').innerHTML = '<div class="loading">Unable to load demo data. Please refresh the page.</div>';
  }
}
init();
