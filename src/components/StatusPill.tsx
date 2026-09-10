const STATUS_TONE: Record<string, string> = {
  pending: "text-warn border-warn/40",
  provisioning: "text-warn border-warn/40",
  online: "text-up border-up/40",
  connected: "text-up border-up/40",
  retired: "text-muted border-line",
  error: "text-down border-danger/40",
};

export function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "text-muted border-line";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[2px] font-mono text-[10px] uppercase tracking-[0.14em] ${tone}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "online" || status === "connected"
            ? "bg-up"
            : status === "error"
              ? "bg-down"
              : "bg-warn"
        }`}
      />
      {status}
    </span>
  );
}
