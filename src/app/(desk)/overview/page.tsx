"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/Field";
import { StatusPill } from "@/components/StatusPill";
import { api, type Account, type CopyRule } from "@/lib/api";

export default function OverviewPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [rules, setRules] = useState<CopyRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.accounts(), api.rules()])
      .then(([a, r]) => {
        setAccounts(a);
        setRules(r);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  const masters = accounts?.filter((a) => a.role === "master") ?? [];
  const slaves = accounts?.filter((a) => a.role === "slave") ?? [];
  const live = accounts?.filter((a) => a.status === "online" || a.status === "connected") ?? [];
  const provisioning = accounts?.filter((a) => a.status === "provisioning") ?? [];
  const enabledRules = rules?.filter((r) => r.enabled) ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">
            Overview
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[32px] tracking-tight">
            Copy desk
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/accounts/new">
            <Button>Add account</Button>
          </Link>
          <Link href="/rules/new">
            <Button tone="ghost">New copy rule</Button>
          </Link>
        </div>
      </header>

      {error ? (
        <p className="border border-warn/40 bg-warn/10 px-3 py-2 text-[13px] text-warn">
          {error}
        </p>
      ) : null}

      <section className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Masters" value={String(masters.length)} hint="IB or MT5" />
        <Stat label="Slaves" value={String(slaves.length)} hint="MT5 terminals" />
        <Stat label="Rules live" value={String(enabledRules.length)} hint="enabled copies" />
        <Stat
          label="Terminals"
          value={accounts ? `${live.length} / ${accounts.length}` : "—"}
          hint={provisioning.length ? `${provisioning.length} provisioning` : "connected"}
        />
      </section>

      {!accounts || accounts.length === 0 ? (
        <EmptyDesk />
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <AccountColumn title="Masters" items={masters} empty="No master yet." />
          <AccountColumn title="Slaves" items={slaves} empty="No slave terminals yet." />
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-ink px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-mono text-[28px] tabular-nums leading-none text-paper">{value}</p>
      <p className="mt-2 text-[12px] text-faint">{hint}</p>
    </div>
  );
}

function AccountColumn({
  title,
  items,
  empty,
}: {
  title: string;
  items: Account[];
  empty: string;
}) {
  return (
    <div className="border border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[13px] uppercase tracking-[0.14em] text-muted">{title}</h2>
        <span className="font-mono text-[11px] text-faint">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-8 text-[13px] text-faint">{empty}</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px]">{item.display_name}</p>
                <p className="truncate font-mono text-[11px] text-faint">
                  {item.kind} · {item.login} · {item.server}
                </p>
              </div>
              <StatusPill status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyDesk() {
  return (
    <div className="border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-[family-name:var(--font-serif)] text-[22px]">The desk is empty</p>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
        Add a master first — Interactive Brokers or MetaTrader 5 — then attach slave MT5
        logins. Saving an account asks the Windows VPS to open a terminal for it.
      </p>
      <Link href="/accounts/new" className="mt-6 inline-block">
        <Button>Add the first account</Button>
      </Link>
    </div>
  );
}
