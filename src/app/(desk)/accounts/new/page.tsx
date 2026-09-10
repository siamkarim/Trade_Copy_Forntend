"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button, ErrorBanner, Field, Select, TextInput } from "@/components/Field";
import { api } from "@/lib/api";

type Kind = "mt5-master" | "ib-master" | "mt5-slave";

export default function NewAccountPage() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("mt5-master");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState("");
  const [ibUser, setIbUser] = useState("");
  const [host, setHost] = useState("127.0.0.1");
  const [port, setPort] = useState("4002");
  const [clientId, setClientId] = useState("1");
  const [ibAccount, setIbAccount] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (kind === "ib-master") {
        await api.addIb({
          display_name: displayName,
          user: ibUser,
          password,
          host,
          port: Number(port),
          client_id: Number(clientId),
          account_id: ibAccount,
        });
      } else {
        await api.addMt5({
          role: kind === "mt5-slave" ? "slave" : "master",
          display_name: displayName,
          login,
          password,
          server,
        });
      }
      router.replace("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-copper">
          New account
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[32px] tracking-tight">
          Connect a terminal
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          Passwords are sent once over HTTPS and stored in the vault. They never come back
          to this page.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 border border-line bg-panel p-5 md:p-6">
        <ErrorBanner message={error} />
        <Field label="What are you adding">
          <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            <option value="mt5-master">MT5 master</option>
            <option value="ib-master">Interactive Brokers master</option>
            <option value="mt5-slave">MT5 slave</option>
          </Select>
        </Field>
        <Field label="Display name">
          <TextInput
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={kind === "ib-master" ? "IB paper" : "ICMarkets live"}
          />
        </Field>

        {kind === "ib-master" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="IB user">
                <TextInput required value={ibUser} onChange={(e) => setIbUser(e.target.value)} />
              </Field>
              <Field label="Password">
                <TextInput
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Gateway host">
                <TextInput value={host} onChange={(e) => setHost(e.target.value)} />
              </Field>
              <Field label="Port" hint="4002 paper, 4001 live">
                <TextInput value={port} onChange={(e) => setPort(e.target.value)} />
              </Field>
              <Field label="Client ID">
                <TextInput value={clientId} onChange={(e) => setClientId(e.target.value)} />
              </Field>
            </div>
            <Field label="Account ID" hint="Optional. Leave blank to use the default account.">
              <TextInput value={ibAccount} onChange={(e) => setIbAccount(e.target.value)} />
            </Field>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="MT5 login">
                <TextInput required value={login} onChange={(e) => setLogin(e.target.value)} />
              </Field>
              <Field label="Password">
                <TextInput
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field
              label="Server"
              hint="Exact broker server name, e.g. ICMarketsSC-Demo."
            >
              <TextInput
                required
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="Broker-Server"
              />
            </Field>
            {kind === "mt5-slave" ? (
              <p className="text-[12px] leading-relaxed text-muted">
                Use the master (trading) password, not the investor password. Investor
                logins cannot place copied trades.
              </p>
            ) : null}
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save and provision"}
          </Button>
          <Button type="button" tone="ghost" onClick={() => router.push("/accounts")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
