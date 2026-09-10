const SYMBOLS = [
  ["EURUSD", "+0.12"],
  ["XAUUSD", "−0.41"],
  ["US500", "+0.08"],
  ["USDJPY", "+0.03"],
  ["GER40", "−0.19"],
  ["GBPUSD", "+0.07"],
  ["USOIL", "+0.22"],
  ["NAS100", "−0.11"],
];

export function TickTape() {
  const row = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS, ...SYMBOLS];
  return (
    <div className="overflow-hidden border-y border-line/80 py-2">
      <div className="tape font-mono text-[11px] tracking-[0.12em] text-muted">
        {row.map(([sym, chg], i) => (
          <span key={`${sym}-${i}`} className="inline-flex gap-2">
            <span className="text-paper/80">{sym}</span>
            <span className={chg.startsWith("+") ? "text-up" : "text-down"}>{chg}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
