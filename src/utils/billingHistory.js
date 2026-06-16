import { getItem, setItem, KEYS, getPlanPrice } from './storage';
import { BILLING_CYCLE_MONTHLY, normalizeBillingCycle } from './planConfig';

const MAX_ENTRIES = 50;

export function recordBillingEvent(proId, { plan, billingCycle = BILLING_CYCLE_MONTHLY, status = 'paid', amount = null, note = '' }) {
  const cycle = normalizeBillingCycle(billingCycle);
  const all = getItem(KEYS.BILLING_HISTORY, {});
  const entry = {
    id: `bill_${Date.now()}`,
    plan,
    billingCycle: cycle,
    status,
    amount: amount ?? getPlanPrice(plan, cycle),
    currency: 'GNF',
    note,
    date: new Date().toISOString(),
  };
  all[proId] = [entry, ...(all[proId] || [])].slice(0, MAX_ENTRIES);
  setItem(KEYS.BILLING_HISTORY, all);
  return entry;
}

export function getBillingHistory(proId) {
  const all = getItem(KEYS.BILLING_HISTORY, {});
  return all[proId] || [];
}

export function getBillingStatusLabel(status) {
  const map = { paid: 'Payé', pending: 'En attente', failed: 'Échoué', refunded: 'Remboursé', cancelled: 'Annulé' };
  return map[status] || status;
}
