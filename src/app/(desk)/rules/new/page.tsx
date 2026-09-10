"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button, ErrorBanner, Field, Select, TextInput } from "@/components/Field";
import { api, type Account } from "@/lib/api";

export default function NewRulePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [masterId, setMasterId] = useState("");
  const [slaveId, setSlaveId] = useState("");
  const [sizingMode, setSizingMode] = useState("equity_ratio");
  const [sizingValue, setSizingValue] = useState("1");
  const [maxLot, setMaxLot] = useState("");
  const [maxDailyLoss, setMaxDailyLoss] = useState("");
  const [whitelist, setWhitelist] = useState("");
  const [copyStops, setCopyStops] = useState(true);
  const [reverse, setReverse] = useState(false);
  const [belowMin, setBelowMin] = useState("skip");

  useEffect(() => {
    api
      .accounts()
      .then((rows) => {
        setAccounts(rows);
        const master = rows.find((r) => r.role === "master");
        const slave = rows.find((r) => r.role === "slave");
        if (master) setMasterId(master.id);
        if (slave) setSlaveId(slave.id);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  const masters = accounts.filter((a) => a.role === "master" && a.status !== "retired");
  const slaves = accounts.filter((a) => a.role === "slave" && a.status !== "retired");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.createRule({
        master_account_id: masterId,
        slave_account_id: slaveId,
        sizing_mode: sizingMode,
        sizing_value: sizingValue,
        max_lot_per_trade: maxLot || undefined,
        max_daily_loss: maxDailyLoss || undefined,
        symbol_whitelist: whitelist
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        copy_sl_tp: copyStops,
        reverse,
        below_min_policy: belowMin,
      });
      router.replace("/rules");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create rule");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">
          New rule
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[32px] tracking-tight">
          Attach a slave
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 border border-line bg-panel p-5 md:p-6">
        <ErrorBanner message={error} />
        {masters.length === 0 || slaves.length === 0 ? (
          <p className="text-[13px] text-warn">
            You need at least one master and one slave before a rule can be created.
          </p>
        ) : null}
        <Field label="Master">
          <Select value={masterId} onChange={(e) => setMasterId(e.target.value)} required>
            <option value="" disabled>
              Select master
            </option>
            {masters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.display_name} ({m.kind})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Slave">
          <Select value={slaveId} onChange={(e) => setSlaveId(e.target.value)} required>
            <option value="" disabled>
              Select slave
            </option>
            {slaves.map((s) => (
              <option key={s.id} value={s.id}>
                {s.display_name} · {s.login}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sizing mode">
            <Select value={sizingMode} onChange={(e) => setSizingMode(e.target.value)}>
              <option value="equity_ratio">Equity ratio (default)</option>
              <option value="fixed_lot">Fixed lot</option>
              <option value="multiplier">Multiplier</option>
              <option value="risk_percent">Risk percent</option>
            </Select>
          </Field>
          <Field
            label="Sizing value"
            hint={
              sizingMode === "fixed_lot"
                ? "Lots per signal, e.g. 0.10"
                : sizingMode === "risk_percent"
                  ? "Fraction of equity, e.g. 0.01"
                  : "Usually 1"
            }
          >
            <TextInput value={sizingValue} onChange={(e) => setSizingValue(e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Max lot per trade">
            <TextInput
              value={maxLot}
              onChange={(e) => setMaxLot(e.target.value)}
              placeholder="optional"
            />
          </Field>
          <Field label="Max daily loss">
            <TextInput
              value={maxDailyLoss}
              onChange={(e) => setMaxDailyLoss(e.target.value)}
              placeholder="optional"
            />
          </Field>
        </div>
        <Field label="Symbol whitelist" hint="Comma-separated master symbols. Empty means all mapped symbols.">
          <TextInput
            value={whitelist}
            onChange={(e) => setWhitelist(e.target.value)}
            placeholder="EURUSD, XAUUSD"
          />
        </Field>
        <Field label="Below-minimum volume">
          <Select value={belowMin} onChange={(e) => setBelowMin(e.target.value)}>
            <option value="skip">Skip and record (recommended)</option>
            <option value="round_up">Round up to broker minimum</option>
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={copyStops}
            onChange={(e) => setCopyStops(e.target.checked)}
          />
          Copy stop-loss and take-profit (by distance, not absolute price)
        </label>
        <label className="flex items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => setReverse(e.target.checked)}
          />
          Reverse copy — slave takes the opposite side
        </label>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={busy || !masterId || !slaveId}>
            {busy ? "Saving…" : "Create rule"}
          </Button>
          <Button type="button" tone="ghost" onClick={() => router.push("/rules")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
