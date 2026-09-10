"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/Field";
import { StatusPill } from "@/components/StatusPill";
import { api, type Account } from "@/lib/api";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setAccounts(await api.accounts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load accounts");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function retire(id: string) {
    if (!confirm("Retire this account? The engine will stop its terminal. Positions are not flattened from here.")) {
      return;
    }
    try {
      await api.retireAccount(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retire account");
    }
  }

  const masters = accounts?.filter((a) => a.role === "master") ?? [];
  const slaves = accounts?.filter((a) => a.role === "slave") ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">
            Accounts
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[32px] tracking-tight">
            Masters and slaves
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">
            Saving an MT5 login provisions a portable terminal on the Windows VPS. Some
            brokers disconnect the older session if you also open the same account at home.
          </p>
        </div>
        <Link href="/accounts/new">
          <Button>Add account</Button>
        </Link>
      </header>

      {error ? (
        <p className="border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-down">
          {error}
        </p>
      ) : null}

      <Table title="Masters" rows={masters} onRetire={retire} empty="No master. Add IB or MT5." />
      <Table title="MT5 slaves" rows={slaves} onRetire={retire} empty="No slaves yet." />
    </div>
  );
}

function Table({
  title,
  rows,
  empty,
  onRetire,
}: {
  title: string;
  rows: Account[];
  empty: string;
  onRetire: (id: string) => void;
}) {
  return (
    <section className="border border-line">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[13px] uppercase tracking-[0.14em] text-muted">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-[13px] text-faint">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              <tr className="border-b border-line">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Kind</th>
                <th className="px-4 py-2 font-medium">Login</th>
                <th className="px-4 py-2 font-medium">Server</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{row.display_name}</td>
                  <td className="px-4 py-3 font-mono text-[12px]">{row.kind}</td>
                  <td className="px-4 py-3 font-mono text-[12px]">{row.login}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[12px] text-muted">
                    {row.server}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                    {row.last_error ? (
                      <p className="mt-1 max-w-[220px] truncate text-[11px] text-down">
                        {row.last_error}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.status !== "retired" ? (
                      <button
                        type="button"
                        onClick={() => onRetire(row.id)}
                        className="text-[12px] text-muted hover:text-down"
                      >
                        Retire
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
