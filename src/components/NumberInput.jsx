export default function NumberInput({
  label,
  value,
  onChange,
  step = "1",
  min = "0",
  suffix,
  prefix,
  hint,
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span>{label}</span>
        {hint ? <span className="muted" style={{ fontSize: 12 }}>{hint}</span> : null}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {prefix ? <span className="tag">{prefix}</span> : null}
        <input
          inputMode="decimal"
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="tag">{suffix}</span> : null}
      </div>
    </label>
  );
}
