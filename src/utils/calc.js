// src/utils/calc.js

// Mortgage payment (principal & interest)
export function monthlyPI(principal, annualRatePct, years) {
  if (!isFinite(principal) || principal <= 0) return null;
  if (!isFinite(annualRatePct) || annualRatePct < 0) return null;
  if (!isFinite(years) || years <= 0) return null;

  const r = (annualRatePct / 100) / 12;
  const n = years * 12;

  if (r === 0) return principal / n;

  const pmt = (principal * r) / (1 - Math.pow(1 + r, -n));
  return pmt;
}

// Effective rent per month after vacancy, plus other income
export function effectiveRentMonthly(targetRentMid, vacancyPct, otherIncome) {
  if (!isFinite(targetRentMid) || targetRentMid < 0) return null;
  const vac = isFinite(vacancyPct) && vacancyPct >= 0 ? vacancyPct : 0;
  const other = isFinite(otherIncome) && otherIncome >= 0 ? otherIncome : 0;
  return targetRentMid * (1 - vac / 100) + other;
}

// Operating expenses per month
export function operatingExpensesMonthly(opts) {
  const taxes = numOrZero(opts.taxes);
  const insurance = numOrZero(opts.insurance);
  const hoa = numOrZero(opts.hoa);
  const maintenance = numOrZero(opts.maintenance);
  const mgmtPct = numOrZero(opts.mgmtPct);
  const capexPct = numOrZero(opts.capexPct);
  const effectiveRent = Math.max(0, numOrZero(opts.effectiveRent));

  const base = taxes + insurance + hoa + maintenance;
  const mgmt = (mgmtPct / 100) * effectiveRent;
  const capex = (capexPct / 100) * effectiveRent;
  return base + mgmt + capex;
}

export function noiMonthly(effectiveRent, opexMonthly) {
  if (!isFinite(effectiveRent) || !isFinite(opexMonthly)) return null;
  return effectiveRent - opexMonthly;
}

export function annualize(x) {
  return isFinite(x) ? x * 12 : null;
}

export function annualDebtService(pmtMonthly) {
  return isFinite(pmtMonthly) ? pmtMonthly * 12 : null;
}

export function dscr(noiAnnual, debtServiceAnnual) {
  if (!isFinite(noiAnnual) || !isFinite(debtServiceAnnual) || debtServiceAnnual === 0) return null;
  return noiAnnual / debtServiceAnnual;
}

// Suggested rent band from mid +/- spread%
export function rentBandFromSpread(targetRentMid, spreadPct) {
  if (!isFinite(targetRentMid) || targetRentMid < 0) {
    return { low: null, mid: null, high: null };
  }
  const s = isFinite(spreadPct) ? spreadPct : 0;
  const low = targetRentMid * (1 - s / 100);
  const high = targetRentMid * (1 + s / 100);
  return { low: low, mid: targetRentMid, high: high };
}

// Monthly cash flow (before taxes)
export function cashFlowMonthly(noiMo, pAndIMo) {
  if (!isFinite(noiMo) || !isFinite(pAndIMo)) return null;
  return noiMo - pAndIMo;
}

function numOrZero(x) {
  return isFinite(x) ? x : 0;
}
