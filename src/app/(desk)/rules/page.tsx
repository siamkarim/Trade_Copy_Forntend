"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/Field";
import { api, type Account, type CopyRule } from "@/lib/api";

export default function RulesPage() {
  const [rules, setRules] = useState<CopyRule[] | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [r, a] = await Promise.all([api.rules(), api.accounts()]);
      setRules(r);
      setAccounts(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load rules");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function name(id: string): string {
    return accounts.find((a) => a.id === id)?.display_name ?? id.slice(0, 8);
  }

  async function toggle(rule: CopyRule) {
    try {
      await api.setRuleEnabled(rule.id, !rule.enabled);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update rule");
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">
            Copy rules
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[32px] tracking-tight">
            Master to slave
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">
            Each rule is one master → one slave. Sizing is translated through notional, not
            by copying the master’s raw lot size.
          </p>
        </div>
        <Link href="/rules/new">
          <Button>New rule</Button>
        </Link>
      </header>

      {error ? (
        <p className="border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-down">
          {error}
        </p>
      ) : null}

      <section className="border border-line">
        {!rules || rules.length === 0 ? (
          <p className="px-4 py-10 text-center text-[14px] text-muted">
            No copy rules yet. Connect a master and a slave, then attach them here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-[13px]">
              <thead className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                <tr className="border-b border-line">
                  <th className="px-4 py-2 font-medium">Master</th>
                  <th className="px-4 py-2 font-medium">Slave</th>
                  <th className="px-4 py-2 font-medium">Sizing</th>
                  <th className="px-4 py-2 font-medium">Caps</th>
                  <th className="px-4 py-2 font-medium">Flags</th>
                  <th className="px-4 py-2 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">{name(rule.master_account_id)}</td>
                    <td className="px-4 py-3">{name(rule.slave_account_id)}</td>
                    <td className="px-4 py-3 font-mono text-[12px]">
                      {rule.sizing_mode.replaceAll("_", " ")} · {rule.sizing_value}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted">
                      {rule.max_lot_per_trade ? `max ${rule.max_lot_per_trade} lot` : "no lot cap"}
                      {rule.max_daily_loss ? ` · loss ${rule.max_daily_loss}` : ""}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted">
                      {rule.reverse ? "reverse · " : ""}
                      {rule.copy_sl_tp ? "SL/TP" : "no stops"}
                      {rule.below_min_policy === "round_up" ? " · round up" : " · skip tiny"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggle(rule)}
                        className={`font-mono text-[11px] uppercase tracking-[0.12em] ${
                          rule.enabled ? "text-up" : "text-muted"
                        }`}
                      >
                        {rule.enabled ? "Enabled" : "Paused"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
