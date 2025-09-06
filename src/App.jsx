import React, { useMemo, useState, useEffect, useRef } from "react";
import Inputs from "./utils/Inputs.jsx";

/* ---------- Global CSS: full-bleed dark + density + print ---------- */
function Styles() {
  return (
    <style>{`
      *,*::before,*::after { box-sizing: border-box; }
      html, body, #root { height: 100%; }
      html { overflow-y: scroll; scrollbar-gutter: stable both-edges; background: #0b1220; }
      body { margin: 0; background: #0b1220 !important; color: #e5e7eb;
             font: 15px/1.45 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }

      .wrap { width: 100%; margin: 0; padding: 20px 24px 40px; }
      .title { font-size: 28px; font-weight: 800; margin: 0 0 6px; }
      .sub   { color: #9aa4b2; margin: 0 0 16px; }
      .grid { display: grid; gap: 22px; align-items: start; }
      @media (min-width: 920px) { .grid { grid-template-columns: 560px minmax(0,1fr); } }

      .card { background: #0e1726; border: 1px solid #1f2a44; border-radius: 16px; padding: 18px;
              box-shadow: 0 6px 24px rgba(0,0,0,.35), 0 2px 8px rgba(0,0,0,.25); }
      .row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 0; }
      .label { color:#9aa4b2; font-size:13px; }
      .hr { border-top: 1px solid #1f2a44; margin: 10px 0; }
      .pos { color:#34d399; font-weight:700; }
      .neg { color:#f87171; font-weight:700; }
      .mono { font-variant-numeric: tabular-nums; }

      .barSticky { position: sticky; top: 0; z-index: 5; background:#0e1726; margin:-18px -18px 12px -18px; padding: 12px 18px 12px;
                   border-bottom: 1px solid #1f2a44; border-top-left-radius: 16px; border-top-right-radius: 16px; }
      .bar { display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
      .btn { background:transparent; color:#e5e7eb; border:1px solid #1f2a44; border-radius:10px; padding:8px 12px; cursor:pointer; }
      .btn:disabled { opacity:.5; cursor:not-allowed; }
      .inputSm, .selectSm { height:36px; padding:6px 10px; border:1px solid #1f2a44; border-radius:10px; background:#0e1726; color:#e5e7eb; outline:none; }
      .chips { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 6px 0; }
      .chip { border:1px solid #1f2a44; background:#0e1726; color:#e5e7eb; border-radius:999px; padding:6px 10px; cursor:pointer; font-size:13px; }
      .chip:hover { border-color:#2b3a63; }
      .sliderRow { display:grid; grid-template-columns: 1fr auto; gap:12px; align-items:center; }
      .slider input[type="range"] { width:100%; accent-color:#6ea8fe; }
      .hintWrap { margin-top:6px; }
      .hint { font-size:12px; color:#fbbf24; }

      /* density */
      .dense .card { padding:14px; }
      .dense .row { padding:6px 0; }
      .dense .btn, .dense .inputSm, .dense .selectSm { padding:6px 10px; height:34px; }

      /* table */
      .tableWrap { overflow:auto; border:1px solid #1f2a44; border-radius:12px; }
      table { border-collapse: collapse; width: 100%; min-width: 880px; }
      th, td { border-bottom: 1px solid #1f2a44; padding: 10px 12px; text-align: right; }
      th:first-child, td:first-child { text-align: left; }
      th.sort { cursor: pointer; user-select: none; }
      .muted { color:#9aa4b2; }

      /* mini-form */
      .mini { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
      .mini input { width: 220px; }

      /* print */
      @media print {
        html, body { background:#fff !important; color:#000 !important; }
        .wrap { padding: 0; }
        .card { box-shadow:none; border:1px solid #ddd; }
        .barSticky, .chips, .slider, .sub, .portfolio, .mini { display:none !important; }
        .grid { grid-template-columns: 1fr !important; gap: 0; }
      }
    `}</style>
  );
}
/* ------------------------------------------------------------- */

/* ---------- Utilities ---------- */
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    .format(Number.isFinite(n) ? n : 0);

const fmtPct = (p) => (Number.isFinite(p) ? `${(Math.round(p * 100) / 100).toFixed(2)}%` : "—");

const toNum = (v) => {
  const s = String(v ?? "").replace(/,/g, "").trim();
  if (s === "" || s === "-" || s === "." || s === "-.") return 0;
  const x = Number(s);
  return Number.isFinite(x) ? x : 0;
};

const maskThousands = (s) => {
  const n = toNum(s);
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const mortgagePI = (loanAmount, ratePct, termYears) => {
  const P = Math.max(0, loanAmount);
  const r = Math.max(0, ratePct) / 100 / 12;
  const n = Math.max(1, Math.round(termYears * 12));
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
};

/* ---------- Storage ---------- */
const LS_KEY = "rentmax_scenarios_v1";
const loadLS = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveLS = (arr) => { try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch {} };

/* ---------- Defaults ---------- */
const DEFAULTS = {
  address: "",
  beds: "5",
  baths: "5",
  sqft: "3537",
  targetRent: "13500",
  vacancyRatePct: "5",
  mgmtFeePct: "0",
  insurance: "330",
  hoa: "0",
  maintenance: "300",
  mortgagePI: "0",
  propertyTaxAnnual: "34500",

  /* Finance (loan) */
  purchasePrice: "",
  downPct: "20",
  ratePct: "6.5",
  termYears: "30",
  pmiAnnualPct: "0.6",
  closingCostPct: "3",
  useLoan: "1",   // "1" = use loan model; "0" = use mortgagePI field
  capexAnnual: "0",
};

/* ---------- Calculations (reusable) ---------- */
function runCalc(values) {
  const v = { ...values };

  const rentMid = Math.max(0, toNum(v.targetRent));
  const rentLow = Math.max(0, rentMid * 0.975);
  const rentHigh = rentMid * 1.025;

  const vacPctRaw = toNum(v.vacancyRatePct);
  const mgmtPctRaw = toNum(v.mgmtFeePct);
  const vacPct = Math.max(0, Math.min(100, vacPctRaw));
  const mgmtPct = Math.max(0, Math.min(100, mgmtPctRaw));

  const vacancy = rentMid * (vacPct / 100);
  const mgmtFee = rentMid * (mgmtPct / 100);
  const effectiveRentMid = Math.max(0, rentMid - vacancy - mgmtFee);

  const taxMonthly = Math.max(0, toNum(v.propertyTaxAnnual)) / 12;
  const ins = Math.max(0, toNum(v.insurance));
  const hoa = Math.max(0, toNum(v.hoa));
  const maint = Math.max(0, toNum(v.maintenance));
  const mortOverride = Math.max(0, toNum(v.mortgagePI));

  const purchasePrice = Math.max(0, toNum(v.purchasePrice));
  const downPct = Math.max(0, toNum(v.downPct));
  const ratePct = Math.max(0, toNum(v.ratePct));
  const termYears = Math.max(1, toNum(v.termYears));
  const closingPct = Math.max(0, toNum(v.closingCostPct));
  const pmiPct = Math.max(0, toNum(v.pmiAnnualPct));
  const useLoan = String(v.useLoan || "1") === "1";

  const loanAmount = Math.max(0, purchasePrice * (1 - downPct / 100));
  const monthlyPI = useLoan && purchasePrice > 0 ? mortgagePI(loanAmount, ratePct, termYears) : mortOverride;
  const monthlyPMI = useLoan && downPct < 20 && pmiPct > 0 ? (loanAmount * (pmiPct / 100)) / 12 : 0;

  const otherFixed = ins + hoa + maint + monthlyPMI;
  const monthlyFixed = taxMonthly + otherFixed + monthlyPI;

  const monthlyCashFlow = effectiveRentMid - monthlyFixed;
  const annualProfit = monthlyCashFlow * 12;

  // NOI & Cap Rate (CapEx excluded from NOI)
  const capexAnnual = Math.max(0, toNum(v.capexAnnual));
  const noi = (effectiveRentMid * 12) - toNum(v.propertyTaxAnnual) - ((ins + hoa + maint) * 12);
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : null;

  // Debt metrics
  const annualDebt = monthlyPI * 12;
  const dscr = annualDebt > 0 ? noi / annualDebt : null;

  // CoC (uses down payment + closing costs)
  const cashInvested = purchasePrice > 0 ? (purchasePrice * (downPct / 100)) + (purchasePrice * (closingPct / 100)) : 0;
  const cashOnCash = cashInvested > 0 ? (annualProfit / cashInvested) * 100 : null;

  // Break-even rent & occupancy (effective = R*(1-vac%-mgmt%))
  const denom = 1 - (vacPct / 100) - (mgmtPct / 100);
  const breakEvenRent = denom > 0 ? monthlyFixed / denom : null;
  const breakEvenOcc = rentMid > 0 ? Math.max(0, Math.min(1, (monthlyFixed / rentMid) + (mgmtPct / 100))) : null;

  return {
    rentLow, rentMid, rentHigh,
    vacancy, mgmtFee, effectiveRentMid,
    taxMonthly, otherFixed, monthlyFixed,
    monthlyPI, monthlyPMI,
    monthlyCashFlow, annualProfit,
    vacPct, mgmtPct,
    noi, capRate,
    dscr, cashOnCash,
    breakEvenRent, breakEvenOcc,
    purchasePrice, loanAmount, downPct, ratePct, termYears, closingPct, pmiPct, capexAnnual,
  };
}

/* ---------- App ---------- */
export default function App() {
  const [density, setDensity] = useState("cozy"); // or 'dense'

  // Keep values as strings (sticky focus lives in Inputs.jsx)
  const [form, setForm] = useState({ ...DEFAULTS });

  // Sticky focus (these props are required by your existing Inputs.jsx)
  const [activeField, setActiveField] = useState(null);
  const [selection, setSelection] = useState({ start: null, end: null });
  const setField = (key, value, selStart, selEnd) => {
    setForm((f) => ({ ...f, [key]: value }));
    setActiveField(key);
    const start = typeof selStart === "number" ? selStart : null;
    const end = typeof selEnd === "number" ? selEnd : start;
    setSelection({ start, end });
  };
  const setFieldExternal = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  /* ----- Scenarios (save/load/rename/delete/import/export) ----- */
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState("My Scenario");
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    const arr = loadLS();
    setScenarios(arr);
    if (arr.length && !selectedId) setSelectedId(arr[0].id);
  }, []);

  const saveScenario = () => {
    const name = (scenarioName || "Scenario").trim();
    const id = `${Date.now()}`;
    const item = { id, name, values: form, createdAt: new Date().toISOString() };
    const next = [item, ...scenarios];
    setScenarios(next); saveLS(next); setSelectedId(id);
  };
  const loadScenario = (id) => {
    const item = scenarios.find((s) => s.id === id);
    if (!item) return;
    setForm(item.values); setSelectedId(id);
    if (activeField) setActiveField(activeField);
  };
  const deleteScenario = () => {
    if (!selectedId) return;
    const next = scenarios.filter((s) => s.id !== selectedId);
    setScenarios(next); saveLS(next); setSelectedId(next[0]?.id || "");
  };
  const renameScenario = () => {
    if (!selectedId) return;
    const name = (scenarioName || "Scenario").trim();
    const next = scenarios.map((s) => s.id === selectedId ? { ...s, name } : s);
    setScenarios(next); saveLS(next);
  };
  const duplicateScenario = (id) => {
    const s = scenarios.find((x) => x.id === id);
    if (!s) return;
    const copy = { ...s, id: `${Date.now()}`, name: `${s.name} (copy)`, createdAt: new Date().toISOString() };
    const next = [copy, ...scenarios];
    setScenarios(next); saveLS(next);
  };

  // Quick Add mini-form
  const [quick, setQuick] = useState({ address: "", targetRent: "" });
  const quickAdd = () => {
    const base = { ...form, address: quick.address, targetRent: quick.targetRent };
    const name = (quick.address || "Quick Scenario").trim();
    const id = `${Date.now()}`;
    const item = { id, name, values: base, createdAt: new Date().toISOString() };
    const next = [item, ...scenarios];
    setScenarios(next); saveLS(next);
    setQuick({ address: "", targetRent: "" });
  };

  // JSON import/export for scenarios
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(scenarios, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "rentmax_scenarios.json";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  };
  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result);
        if (!Array.isArray(arr)) return;
        setScenarios(arr); saveLS(arr); setSelectedId(arr[0]?.id || "");
      } catch {}
    };
    reader.readAsText(file);
  };
  const fileJsonRef = useRef(null);

  /* ----- Bulk CSV Import (map → preview → import) ----- */
  const [csvMap, setCsvMap] = useState(null); // { headers:[], rows:[{}], map:{key->header} }
  const fileCsvRef = useRef(null);

  const parseCSV = (text) => {
    // simple CSV parser (handles quoted cells)
    const rows = [];
    const re = /(?:^|\\n)(?:(?:"([^"]*(?:""[^"]*)*)"|([^"\\n]*))(?:,|$))/g;
    const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
    const header = splitCSVLine(lines[0]);
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i]);
      const obj = {};
      header.forEach((h, idx) => (obj[h] = cells[idx] ?? ""));
      rows.push(obj);
    }
    return { header, rows };
  };
  const splitCSVLine = (line) => {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ",") { out.push(cur); cur = ""; }
        else cur += c;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  };

  const guessMap = (headers) => {
    const want = ["address","beds","baths","sqft","targetRent","vacancyRatePct","mgmtFeePct","insurance","hoa","maintenance","mortgagePI","propertyTaxAnnual","purchasePrice","downPct","ratePct","termYears"];
    const m = {};
    headers.forEach(h => {
      const k = h.toLowerCase().replace(/[^a-z0-9]/g,"");
      const hit =
        (k.includes("address") && "address") ||
        (k === "bed" || k.includes("beds") ? "beds" : null) ||
        (k.includes("bath") ? "baths" : null) ||
        (k.includes("sqft") || k.includes("squarefeet") ? "sqft" : null) ||
        (k.includes("rent") ? "targetRent" : null) ||
        (k.includes("vac") ? "vacancyRatePct" : null) ||
        (k.includes("mgmt") || k.includes("manage") ? "mgmtFeePct" : null) ||
        (k.includes("ins") ? "insurance" : null) ||
        (k === "hoa" ? "hoa" : null) ||
        (k.includes("maint") ? "maintenance" : null) ||
        (k.includes("mort") && k.includes("pi") ? "mortgagePI" : null) ||
        (k.includes("tax") ? "propertyTaxAnnual" : null) ||
        (k.includes("price") ? "purchasePrice" : null) ||
        (k.includes("down") ? "downPct" : null) ||
        (k.includes("rate") ? "ratePct" : null) ||
        (k.includes("term") ? "termYears" : null);
      if (hit) m[hit] = h;
    });
    // ensure targetRent at least
    if (!m.targetRent) m.targetRent = headers.find(h => /rent/i.test(h)) || headers[0];
    return m;
  };

  const onImportCSV = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { header, rows } = parseCSV(String(reader.result || ""));
      setCsvMap({ headers: header, rows, map: guessMap(header) });
    };
    reader.readAsText(file);
  };

  const commitCsvImport = () => {
    if (!csvMap) return;
    const { rows, map } = csvMap;
    const next = [...scenarios];
    rows.forEach((r) => {
      const vals = { ...DEFAULTS };
      Object.entries(map).forEach(([key, header]) => {
        if (!header) return;
        vals[key] = String(r[header] ?? "");
      });
      const name = (vals.address || `Imported ${Date.now() % 10000}`).trim();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      next.unshift({ id, name, values: vals, createdAt: new Date().toISOString() });
    });
    setScenarios(next); saveLS(next); setCsvMap(null);
  };

  /* ----- CSV/Print ----- */
  const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const downloadCSV = () => {
    const h = [
      "Address","Beds","Baths","SqFt","TargetRent","VacancyRatePct","MgmtFeePct",
      "Insurance","HOA","Maintenance","MortgagePI","PropertyTaxAnnual",
      "PurchasePrice","DownPct","RatePct","TermYears","PMIAnnualPct","ClosingCostPct",
      "SuggestedRentLow","SuggestedRentMid","SuggestedRentHigh",
      "VacancyMonthly","MgmtFeeMonthly","EffectiveRentMid",
      "PropertyTaxMonthly","OtherFixedCosts","MonthlyPI","MonthlyPMI",
      "MonthlyCashFlow","AnnualProfit","NOI","CapRatePct","DSCR","CashOnCashPct",
      "BreakEvenRent","BreakEvenOccPct"
    ];
    const c = runCalc(form);
    const vals = [
      form.address, form.beds, form.baths, form.sqft, form.targetRent, form.vacancyRatePct, form.mgmtFeePct,
      form.insurance, form.hoa, form.maintenance, form.mortgagePI, form.propertyTaxAnnual,
      form.purchasePrice, form.downPct, form.ratePct, form.termYears, form.pmiAnnualPct, form.closingCostPct,
      Math.round(c.rentLow), Math.round(c.rentMid), Math.round(c.rentHigh),
      Math.round(c.vacancy), Math.round(c.mgmtFee), Math.round(c.effectiveRentMid),
      Math.round(c.taxMonthly), Math.round(c.otherFixed), Math.round(c.monthlyPI), Math.round(c.monthlyPMI),
      Math.round(c.monthlyCashFlow), Math.round(c.annualProfit), Math.round(c.noi),
      c.capRate==null?"":(Math.round(c.capRate*100)/100), c.dscr==null?"":(Math.round(c.dscr*100)/100)/100*100,
      c.cashOnCash==null?"":(Math.round(c.cashOnCash*100)/100),
      c.breakEvenRent==null?"":Math.round(c.breakEvenRent),
      c.breakEvenOcc==null?"":(Math.round(c.breakEvenOcc*10000)/100)
    ];
    const content = h.join(",") + "\n" + vals.map(csvEscape).join(",") + "\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "rentmax_export.csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  };
  
  const printPDF = () => {
    const report = document.getElementById("report");
    if (!report) { window.print(); return; }

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>RentMax Report</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font: 14px/1.4 system-ui, sans-serif; color: #000; }
    .row { display:flex; justify-content:space-between; padding:6px 0; }
    .label { color:#555; font-size:12px; }
    .hr { border-top:1px solid #ddd; margin:8px 0; }
    .pos { color:#065f46; font-weight:700; }
    .neg { color:#b91c1c; font-weight:700; }
    .mono { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <div style="max-width:720px; margin:0 auto;">
    ${report.outerHTML}
  </div>
  <script>
    window.onload = () => { window.print(); setTimeout(()=>window.close(), 200); };
  </script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) { window.print(); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };


  /* ----- Keyboard power (save, quick switch, esc clear, nudges already in place) ----- */
  const selectRef = useRef(null);
  useEffect(() => {
    const steps = {
      targetRent: 25, insurance: 25, hoa: 25, maintenance: 25,
      mortgagePI: 50, propertyTaxAnnual: 100, sqft: 50, beds: 1, baths: 1,
      purchasePrice: 1000, capexAnnual: 100, downPct: 1, ratePct: 0.125, termYears: 1,
      vacancyRatePct: 1, mgmtFeePct: 1, pmiAnnualPct: 0.1, closingCostPct: 0.25
    };
    const onKey = (e) => {
      // Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault(); saveScenario(); return;
      }
      // Quick switch
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); try { selectRef.current?.focus(); } catch {} return;
      }
      // Esc clear current field
      if (e.key === "Escape" && activeField) {
        e.preventDefault(); setFieldExternal(activeField, ""); return;
      }
      // Nudges
      if (!activeField || !(activeField in steps)) return;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const mult = e.shiftKey ? 5 : 1;
      const step = steps[activeField] * mult;
      const cur = toNum(form[activeField]);
      const next = e.key === "ArrowUp" ? cur + step : Math.max(0, cur - step);
      setFieldExternal(activeField, String(next));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeField, form, scenarios]);

  /* ----- Calculations ----- */
  const calc = useMemo(() => runCalc(form), [form]);

  /* ----- Portfolio (table) ----- */
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [compareIds, setCompareIds] = useState([]);

  const portfolio = useMemo(() => {
    const rows = scenarios.map((s) => {
      const k = runCalc(s.values);
      return {
        id: s.id,
        name: s.name,
        createdAt: s.createdAt,
        address: s.values.address,
        rent: toNum(s.values.targetRent),
        cf: k.monthlyCashFlow,
        noi: k.noi,
        cap: k.capRate,
        dscr: k.dscr,
        coc: k.cashOnCash,
      };
    }).filter(r => {
      const q = filter.trim().toLowerCase();
      if (!q) return true;
      return [r.name, r.address].some(x => String(x||"").toLowerCase().includes(q));
    });

    rows.sort((a,b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const A = a[sortKey]; const B = b[sortKey];
      if (A == null && B != null) return 1;
      if (A != null && B == null) return -1;
      if (A == null && B == null) return 0;
      if (typeof A === "string") return dir * A.localeCompare(B);
      return dir * (A - B);
    });

    return rows;
  }, [scenarios, filter, sortKey, sortDir]);

  const toggleCompare = (id) => {
    setCompareIds((ids) => {
      if (ids.includes(id)) return ids.filter(x => x !== id);
      if (ids.length >= 2) return [ids[1], id];
      return [...ids, id];
    });
  };
  const clearCompare = () => setCompareIds([]);

  const portfolioCSV = () => {
    const headers = ["Name","Address","Rent","MonthlyCF","NOI","CapRate%","DSCR","CoC%","CreatedAt"];
    const rows = portfolio.map(r => [
      r.name, r.address, Math.round(r.rent), Math.round(r.cf), Math.round(r.noi),
      r.cap==null?"":(Math.round(r.cap*100)/100), r.dscr==null?"":(Math.round(r.dscr*100)/100),
      r.coc==null?"":(Math.round(r.coc*100)/100), r.createdAt
    ]);
    const content = [headers.join(",")].concat(rows.map(row => row.map(csvEscape).join(","))).join("\n") + "\n";
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "rentmax_portfolio.csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  };

  /* ----- Slider ----- */
  const [sliderBase, setSliderBase] = useState(() => toNum(form.targetRent));
  const minRent = Math.max(0, Math.round(sliderBase * 0.9));
  const maxRent = Math.max(minRent, Math.round(sliderBase * 1.1));
  const onSlider = (e) => setFieldExternal("targetRent", String(e.target.value));
  const recenterSlider = () => setSliderBase(toNum(form.targetRent));

  /* ----- Right-card finance inputs (masked on blur) ----- */
  const maskOnBlur = (key) => (e) => setFieldExternal(key, maskThousands(e.target.value));
  const unmaskOnFocus = (key) => (e) => setFieldExternal(key, String(e.target.value).replace(/,/g,""));

  /* ----- Density ----- */
  const flipDensity = () => setDensity(d => d === "dense" ? "cozy" : "dense");

  /* ----- Hints (validation) ----- */
  const hints = [];
  if (toNum(form.vacancyRatePct) > 100 || toNum(form.vacancyRatePct) < 0) hints.push("Vacancy % should be 0–100 (clamped in calc).");
  if (toNum(form.mgmtFeePct) > 100 || toNum(form.mgmtFeePct) < 0) hints.push("Management % should be 0–100 (clamped in calc).");
  if (toNum(form.targetRent) < 0) hints.push("Target Rent can’t be negative (treated as 0).");
  if (toNum(form.propertyTaxAnnual) < 0) hints.push("Property Tax can’t be negative (treated as 0).");
  if (toNum(form.purchasePrice) && calc.noi < 0) hints.push("NOI is negative — cap rate not meaningful.");

  const wide = typeof window !== "undefined" && window.innerWidth >= 920;

  return (
    <>
      <Styles />
      <div className={density === "dense" ? "wrap dense" : "wrap"}>
        <h1 className="title">RentMax</h1>

        <div className="grid" style={wide ? undefined : { gridTemplateColumns: "1fr" }}>
          {/* LEFT: Inputs + presets + hints */}
          <section className="card">
            <Inputs
              values={form}
              setField={setField}
              activeField={activeField}
              selection={selection}
              onFocusField={setActiveField}
            />
            <div className="chips">
              <button className="chip" onClick={() => { setFieldExternal("vacancyRatePct","3"); setFieldExternal("mgmtFeePct","0"); setFieldExternal("maintenance","200"); }} type="button">Optimistic</button>
              <button className="chip" onClick={() => { setFieldExternal("vacancyRatePct","5"); setFieldExternal("mgmtFeePct","5"); setFieldExternal("maintenance","300"); }} type="button">Base</button>
              <button className="chip" onClick={() => { setFieldExternal("vacancyRatePct","8"); setFieldExternal("mgmtFeePct","8"); setFieldExternal("maintenance","400"); }} type="button">Conservative</button>
            </div>
            <div className="row" style={{ paddingTop: 0 }}>
              <span className="label">Assumptions</span>
              <span className="mono">{calc.vacPct}% vac · {calc.mgmtPct}% mgmt · Maint ${Math.max(0, toNum(form.maintenance))}</span>
            </div>
            {hints.length > 0 && (
              <div className="hintWrap">
                {hints.map((h, i) => (<div key={i} className="hint">• {h}</div>))}
              </div>
            )}
          </section>

          {/* RIGHT: Actions + Finance + Results + Slider + Portfolio */}
          <section className="card">
            {/* Sticky actions */}
            <div className="barSticky">
              <div className="bar">
                <button className="btn" type="button" onClick={flipDensity} title="Toggle density">{density === "dense" ? "Cozy" : "Dense"}</button>

                <input className="inputSm" type="text" value={scenarioName} onChange={(e)=>setScenarioName(e.target.value)} placeholder="Scenario name"/>
                <button className="btn" type="button" onClick={saveScenario} title="Save (Ctrl/Cmd+S)">Save</button>
                <select className="selectSm" ref={selectRef} value={selectedId} onChange={(e)=>loadScenario(e.target.value)}>
                  <option value="">Load…</option>
                  {scenarios.map((s)=>(
                    <option key={s.id} value={s.id}>{s.name} — {new Date(s.createdAt).toLocaleString()}</option>
                  ))}
                </select>
                <button className="btn" type="button" onClick={renameScenario} disabled={!selectedId}>Rename</button>
                <button className="btn" type="button" onClick={deleteScenario} disabled={!selectedId}>Delete</button>

                <button className="btn" type="button" onClick={downloadCSV}>CSV</button>
                <button className="btn" type="button" onClick={printPDF}>Print/PDF</button>

                <button className="btn" type="button" onClick={exportJSON} title="Export scenarios">Export JSON</button>
                <input ref={fileJsonRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e)=>importJSON(e.target.files?.[0])}/>
                <button className="btn" type="button" onClick={()=>fileJsonRef.current?.click()} title="Import scenarios">Import JSON</button>

                <input ref={fileCsvRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={(e)=>onImportCSV(e.target.files?.[0])}/>
                <button className="btn" type="button" onClick={()=>fileCsvRef.current?.click()} title="Bulk import properties via CSV">Import CSV</button>
              </div>
              {/* Bulk CSV mapping/preview */}
              {csvMap && (
                <div style={{ marginTop: 10, borderTop: "1px solid #1f2a44", paddingTop: 10 }}>
                  <div className="row" style={{ paddingTop: 0 }}>
                    <span className="label">CSV Mapping</span>
                    <span className="muted">Choose which CSV columns map to fields</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
                    {["address","beds","baths","sqft","targetRent","vacancyRatePct","mgmtFeePct","insurance","hoa","maintenance","mortgagePI","propertyTaxAnnual","purchasePrice","downPct","ratePct","termYears"].map((key)=>(
                      <div key={key} className="row" style={{ paddingTop:0 }}>
                        <span className="label" style={{ textTransform:"none" }}>{key}</span>
                        <select className="selectSm" value={csvMap.map[key]||""}
                          onChange={(e)=>setCsvMap((m)=>({...m, map:{ ...m.map, [key]: e.target.value }}))}>
                          <option value="">—</option>
                          {csvMap.headers.map((h)=> <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="bar" style={{ justifyContent:"flex-start", marginTop:10 }}>
                    <button className="btn" type="button" onClick={commitCsvImport}>Import Rows</button>
                    <button className="btn" type="button" onClick={()=>setCsvMap(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add mini-form */}
            <div className="mini">
              <input className="inputSm" type="text" placeholder="Address" value={quick.address} onChange={(e)=>setQuick(q=>({...q, address:e.target.value}))}/>
              <input className="inputSm mono" type="text" placeholder="Target Rent" value={quick.targetRent} onChange={(e)=>setQuick(q=>({...q, targetRent:e.target.value}))}/>
              <button className="btn" type="button" onClick={quickAdd}>Quick Add</button>
            </div>

            {/* Finance add-ons (masked on blur, raw while typing) */}
            <div className="row" style={{ paddingTop: 4 }}>
              <span className="label">Purchase Price</span>
              <input className="inputSm mono" style={{ width: 180, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.purchasePrice} onFocus={unmaskOnFocus("purchasePrice")} onBlur={maskOnBlur("purchasePrice")}
                onChange={(e)=>setFieldExternal("purchasePrice", e.target.value)} placeholder="e.g., 850,000" />
            </div>
            <div className="row" style={{ paddingTop: 0 }}>
              <span className="label">Down %</span>
              <input className="inputSm mono" style={{ width: 100, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.downPct} onChange={(e)=>setFieldExternal("downPct", e.target.value)} />
              <span className="label">Rate %</span>
              <input className="inputSm mono" style={{ width: 100, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.ratePct} onChange={(e)=>setFieldExternal("ratePct", e.target.value)} />
            </div>
            <div className="row" style={{ paddingTop: 0 }}>
              <span className="label">Term (years)</span>
              <input className="inputSm mono" style={{ width: 100, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.termYears} onChange={(e)=>setFieldExternal("termYears", e.target.value)} />
              <span className="label">PMI % (annual)</span>
              <input className="inputSm mono" style={{ width: 120, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.pmiAnnualPct} onChange={(e)=>setFieldExternal("pmiAnnualPct", e.target.value)} />
            </div>
            <div className="row" style={{ paddingTop: 0 }}>
              <span className="label">Closing %</span>
              <input className="inputSm mono" style={{ width: 100, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.closingCostPct} onChange={(e)=>setFieldExternal("closingCostPct", e.target.value)} />
              <span className="label">Use Loan</span>
              <select className="selectSm" style={{ width: 220 }} value={form.useLoan} onChange={(e)=>setFieldExternal("useLoan", e.target.value)}>
                <option value="1">Yes</option>
                <option value="0">No (use P&I field)</option>
              </select>
            </div>
            <div className="row" style={{ paddingTop: 0 }}>
              <span className="label">CapEx (annual)</span>
              <input className="inputSm mono" style={{ width: 180, textAlign: "right" }} type="text" inputMode="numeric"
                value={form.capexAnnual} onFocus={unmaskOnFocus("capexAnnual")} onBlur={maskOnBlur("capexAnnual")}
                onChange={(e)=>setFieldExternal("capexAnnual", e.target.value)} placeholder="0" />
            </div>

            {/* Slider */}
            <div className="slider">
              <div className="sliderRow">
                <div>
                  <div className="label">Rent Slider ({fmtUSD(minRent)}–{fmtUSD(maxRent)})</div>
                  <input type="range" min={minRent} max={maxRent} step={25} value={toNum(form.targetRent)} onChange={onSlider}/>
                </div>
                <div style={{ display:"grid", gap:6, justifyItems:"end" }}>
                  <div className="mono">{fmtUSD(toNum(form.targetRent))}</div>
                  <button className="btn" type="button" onClick={recenterSlider}>Recenter</button>
                </div>
              </div>
            </div>

            <div className="hr" />
            {/* Results */}
<div id="report">
            <div className="row"><span className="label">Address</span><span>{form.address || "—"}</span></div>
            <div className="row"><span className="label">Beds / Baths / SqFt</span><span>{`${form.beds || 0} / ${form.baths || 0} / ${form.sqft || 0}`}</span></div>
            <div className="hr" />
            <div className="row"><span className="label">Suggested Rent (Low)</span><span>{fmtUSD(calc.rentLow)}</span></div>
            <div className="row"><span className="label">Suggested Rent (Mid / Target)</span><span>{fmtUSD(calc.rentMid)}</span></div>
            <div className="row"><span className="label">Suggested Rent (High)</span><span>{fmtUSD(calc.rentHigh)}</span></div>
            <div className="hr" />
            <div className="row"><span className="label">Vacancy (monthly)</span><span>-{fmtUSD(calc.vacancy)}</span></div>
            <div className="row"><span className="label">Mgmt Fee (monthly)</span><span>-{fmtUSD(calc.mgmtFee)}</span></div>
            <div className="row"><span className="label">Effective Rent</span><span>{fmtUSD(calc.effectiveRentMid)}</span></div>
            <div className="hr" />
            <div className="row"><span className="label">Property Tax (monthly)</span><span>-{fmtUSD(calc.taxMonthly)}</span></div>
            <div className="row"><span className="label">Other Fixed (ins/HOA/maint/PMI)</span><span>-{fmtUSD(calc.otherFixed)}</span></div>
            <div className="row"><span className="label">P&I (monthly)</span><span>-{fmtUSD(calc.monthlyPI)}</span></div>
            {calc.monthlyPMI > 0 && <div className="row"><span className="label">PMI (monthly)</span><span>-{fmtUSD(calc.monthlyPMI)}</span></div>}
            <div className="hr" />
            <div className="row">
              <span className="label">Monthly Cash Flow</span>
              <span className={`mono ${calc.monthlyCashFlow >= 0 ? "pos" : "neg"}`}>{fmtUSD(calc.monthlyCashFlow)}</span>
            </div>
            <div className="row">
              <span className="label">Annual Profit</span>
              <span className={`mono ${calc.annualProfit >= 0 ? "pos" : "neg"}`}>{fmtUSD(calc.annualProfit)}</span>
            </div>
            <div className="hr" />
            <div className="row"><span className="label">NOI (annual)</span><span className="mono">{fmtUSD(calc.noi)}</span></div>
            <div className="row"><span className="label">Cap Rate</span><span className="mono">{calc.capRate==null?"—":fmtPct(Math.round(calc.capRate*100)/100)}</span></div>
            <div className="row"><span className="label">DSCR</span><span className="mono">{calc.dscr==null?"—":(Math.round(calc.dscr*100)/100).toFixed(2)}</span></div>
            <div className="row"><span className="label">Cash-on-Cash</span><span className="mono">{calc.cashOnCash==null?"—":fmtPct(Math.round(calc.cashOnCash*100)/100)}</span></div>
            <div className="row"><span className="label">Break-Even Rent</span><span className="mono">{calc.breakEvenRent==null?"—":fmtUSD(calc.breakEvenRent)}</span></div>
            <div className="row"><span className="label">Break-Even Occupancy</span><span className="mono">{calc.breakEvenOcc==null?"—":fmtPct((calc.breakEvenOcc*100))}</span></div>

            
            <div className="hr" />
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "12px", textAlign: "center" }}>
              Disclaimer: This report is for informational purposes only and is not financial advice.
            </div>

        </div>
{/* Portfolio (table) */}
            <div className="hr" />
            <div className="portfolio">
              <div className="row" style={{ paddingTop: 0 }}>
                <span className="label">Portfolio</span>
                <span>
                  <input className="inputSm" placeholder="Filter…" value={filter} onChange={(e)=>setFilter(e.target.value)} style={{ width: 200 }} />
                  <button className="btn" style={{ marginLeft: 8 }} onClick={portfolioCSV} type="button">Export Table</button>
                </span>
              </div>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th className="sort" onClick={()=>{ setSortKey("name"); setSortDir(d=>d==="asc"?"desc":"asc");}}>Name {sortKey==="name"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th className="sort" onClick={()=>{ setSortKey("rent"); setSortDir(d=>d==="asc"?"desc":"asc");}}>Rent {sortKey==="rent"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th className="sort" onClick={()=>{ setSortKey("cf"); setSortDir(d=>d==="asc"?"desc":"asc");}}>Cash Flow {sortKey==="cf"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th className="sort" onClick={()=>{ setSortKey("noi"); setSortDir(d=>d==="asc"?"desc":"asc");}}>NOI {sortKey==="noi"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th className="sort" onClick={()=>{ setSortKey("cap"); setSortDir(d=>d==="asc"?"desc":"asc");}}>Cap % {sortKey==="cap"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th className="sort" onClick={()=>{ setSortKey("dscr"); setSortDir(d=>d==="asc"?"desc":"asc");}}>DSCR {sortKey==="dscr"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th className="sort" onClick={()=>{ setSortKey("coc"); setSortDir(d=>d==="asc"?"desc":"asc");}}>CoC % {sortKey==="coc"?(sortDir==="asc"?"▲":"▼"):""}</th>
                      <th>Actions</th>
                      <th>Compare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((r) => (
                      <tr key={r.id}>
                        <td style={{ textAlign:"left" }}>{r.name}</td>
                        <td className="mono">{fmtUSD(r.rent)}</td>
                        <td className={`mono ${r.cf>=0?"pos":"neg"}`}>{fmtUSD(r.cf)}</td>
                        <td className="mono">{fmtUSD(r.noi)}</td>
                        <td className="mono">{r.cap==null?"—":fmtPct(Math.round(r.cap*100)/100)}</td>
                        <td className="mono">{r.dscr==null?"—":(Math.round(r.dscr*100)/100).toFixed(2)}</td>
                        <td className="mono">{r.coc==null?"—":fmtPct(Math.round(r.coc*100)/100)}</td>
                        <td>
                          <button className="btn" onClick={()=>loadScenario(r.id)} type="button">Load</button>{" "}
                          <button className="btn" onClick={()=>duplicateScenario(r.id)} type="button">Duplicate</button>
                        </td>
                        <td>
                          <input type="checkbox" checked={compareIds.includes(r.id)} onChange={()=>toggleCompare(r.id)} />
                        </td>
                      </tr>
                    ))}
                    {portfolio.length === 0 && (
                      <tr><td colSpan={9} className="muted" style={{ textAlign:"center", padding:"16px" }}>No scenarios yet — save one or import CSV.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Compare two selected rows */}
              {compareIds.length > 0 && (
                <>
                  <div className="row"><span className="label">Compare Selected</span><span><button className="btn" onClick={clearCompare} type="button">Clear</button></span></div>
                  <div className="tableWrap" style={{ marginTop: 8 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Metric</th>
                          {compareIds.map((id)=> {
                            const s = scenarios.find(x=>x.id===id);
                            return <th key={id} style={{ textAlign:"left" }}>{s?.name || id}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const cols = compareIds.map(id => runCalc((scenarios.find(x=>x.id===id)||{}).values||{}));
                          const rows = [
                            ["Rent", ...cols.map(c=>fmtUSD(c.rentMid))],
                            ["Cash Flow (mo)", ...cols.map(c=>fmtUSD(c.monthlyCashFlow))],
                            ["NOI (yr)", ...cols.map(c=>fmtUSD(c.noi))],
                            ["Cap Rate", ...cols.map(c=>c.capRate==null?"—":fmtPct(Math.round(c.capRate*100)/100))],
                            ["DSCR", ...cols.map(c=>c.dscr==null?"—":(Math.round(c.dscr*100)/100).toFixed(2))],
                            ["CoC %", ...cols.map(c=>c.cashOnCash==null?"—":fmtPct(Math.round(c.cashOnCash*100)/100))],
                            ["Break-Even Rent", ...cols.map(c=>c.breakEvenRent==null?"—":fmtUSD(c.breakEvenRent))],
                          ];
                          return rows.map((r,i)=>(
                            <tr key={i}>
                              <td style={{ textAlign:"left" }}>{r[0]}</td>
                              {r.slice(1).map((v, j)=><td key={j}>{v}</td>)}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
