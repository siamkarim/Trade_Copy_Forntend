export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-[family-name:var(--font-serif)] text-[22px] font-medium tracking-tight text-paper">
        TradeCopy
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-copper-dim">
        IB · MT5
      </span>
    </div>
  );
}
