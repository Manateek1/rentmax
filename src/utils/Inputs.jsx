import React, { useLayoutEffect, useRef } from "react";

/** Inputs with sticky focus:
 *  - We record which field is active + caret positions
 *  - After every render, we re-focus that field and restore the caret
 *  - Prevents the “kicked out of the box on each keystroke” issue
 */
export default function Inputs({ values, setField, activeField, selection, onFocusField }) {
  // single ref map for all inputs
  const refs = useRef({});

  // After every render, if a field is marked active, focus it and restore caret.
  useLayoutEffect(() => {
    if (!activeField) return;
    const el = refs.current[activeField];
    if (!el) return;

    // Focus if needed
    if (document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
    // Restore caret if we have it
    const { start, end } = selection || {};
    if (typeof start === "number" && typeof end === "number") {
      try { el.setSelectionRange(start, end); } catch {}
    }
  });

  const base = {
    width: "100%",
    height: 44,
    padding: "10px 12px",
    border: "1px solid #1f2a44",
    borderRadius: 12,
    background: "#0e1726",
    color: "#e5e7eb",
    outline: "none",
    boxShadow: "none",
    transition: "none",
    font: "inherit",
    lineHeight: "22px",
    WebkitAppearance: "none",
    MozAppearance: "textfield",
  };
  const label = { display: "block", marginBottom: 12 };
  const labelSpan = { display: "block", fontSize: 13, color: "#9aa4b2", marginBottom: 6 };
  const two = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 };

  // unified onChange that records caret too
  const onChange = (key) => (e) => {
    const { value, selectionStart, selectionEnd } = e.target;
    setField(key, value, selectionStart, selectionEnd);
  };
  const onFocus = (key) => () => onFocusField(key);

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      <label style={label}>
        <span style={labelSpan}>Address</span>
        <input
          ref={(el) => (refs.current.address = el)}
          data-field="address"
          style={base}
          type="text"
          value={values.address}
          onChange={onChange("address")}
          onFocus={onFocus("address")}
          autoComplete="off"
          spellCheck={false}
          placeholder="123 Main St"
        />
      </label>

      <div style={two}>
        <label style={label}>
          <span style={labelSpan}>Beds</span>
          <input
            ref={(el) => (refs.current.beds = el)}
            data-field="beds"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.beds}
            onChange={onChange("beds")}
            onFocus={onFocus("beds")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label style={label}>
          <span style={labelSpan}>Baths</span>
          <input
            ref={(el) => (refs.current.baths = el)}
            data-field="baths"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.baths}
            onChange={onChange("baths")}
            onFocus={onFocus("baths")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </div>

      <label style={label}>
        <span style={labelSpan}>Square Feet</span>
        <input
          ref={(el) => (refs.current.sqft = el)}
          data-field="sqft"
          style={base}
          type="text"
          inputMode="numeric"
          value={values.sqft}
          onChange={onChange("sqft")}
          onFocus={onFocus("sqft")}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div style={two}>
        <label style={label}>
          <span style={labelSpan}>Target Rent (monthly)</span>
          <input
            ref={(el) => (refs.current.targetRent = el)}
            data-field="targetRent"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.targetRent}
            onChange={onChange("targetRent")}
            onFocus={onFocus("targetRent")}
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g., 13500"
          />
        </label>
        <label style={label}>
          <span style={labelSpan}>Vacancy Rate %</span>
          <input
            ref={(el) => (refs.current.vacancyRatePct = el)}
            data-field="vacancyRatePct"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.vacancyRatePct}
            onChange={onChange("vacancyRatePct")}
            onFocus={onFocus("vacancyRatePct")}
            autoComplete="off"
            spellCheck={false}
            placeholder="5"
          />
        </label>
      </div>

      <label style={label}>
        <span style={labelSpan}>Management Fee %</span>
        <input
          ref={(el) => (refs.current.mgmtFeePct = el)}
          data-field="mgmtFeePct"
          style={base}
          type="text"
          inputMode="numeric"
          value={values.mgmtFeePct}
          onChange={onChange("mgmtFeePct")}
          onFocus={onFocus("mgmtFeePct")}
          autoComplete="off"
          spellCheck={false}
          placeholder="0–10"
        />
      </label>

      <div style={two}>
        <label style={label}>
          <span style={labelSpan}>Insurance (monthly)</span>
          <input
            ref={(el) => (refs.current.insurance = el)}
            data-field="insurance"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.insurance}
            onChange={onChange("insurance")}
            onFocus={onFocus("insurance")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label style={label}>
          <span style={labelSpan}>HOA (monthly)</span>
          <input
            ref={(el) => (refs.current.hoa = el)}
            data-field="hoa"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.hoa}
            onChange={onChange("hoa")}
            onFocus={onFocus("hoa")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </div>

      <div style={two}>
        <label style={label}>
          <span style={labelSpan}>Maintenance (monthly)</span>
          <input
            ref={(el) => (refs.current.maintenance = el)}
            data-field="maintenance"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.maintenance}
            onChange={onChange("maintenance")}
            onFocus={onFocus("maintenance")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label style={label}>
          <span style={labelSpan}>Mortgage P&I (monthly)</span>
          <input
            ref={(el) => (refs.current.mortgagePI = el)}
            data-field="mortgagePI"
            style={base}
            type="text"
            inputMode="numeric"
            value={values.mortgagePI}
            onChange={onChange("mortgagePI")}
            onFocus={onFocus("mortgagePI")}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </div>

      <label style={label}>
        <span style={labelSpan}>Property Tax (annual)</span>
        <input
          ref={(el) => (refs.current.propertyTaxAnnual = el)}
          data-field="propertyTaxAnnual"
          style={base}
          type="text"
          inputMode="numeric"
          value={values.propertyTaxAnnual}
          onChange={onChange("propertyTaxAnnual")}
          onFocus={onFocus("propertyTaxAnnual")}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
    </form>
  );
}
