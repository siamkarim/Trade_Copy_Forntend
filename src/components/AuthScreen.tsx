"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button, ErrorBanner, Field, TextInput } from "@/components/Field";
import { TickTape } from "@/components/TickTape";
import { Wordmark } from "@/components/Wordmark";
import { api, setSession } from "@/lib/api";

type Mode = "login" | "register";

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ email, password, full_name: fullName });
      setSession(result.access_token);
      router.replace("/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line px-12 py-10 lg:flex">
        <div className="hairline pointer-events-none absolute inset-0 opacity-40" />
        <Wordmark />
        <div className="relative max-w-md">
          <p className="font-[family-name:var(--font-serif)] text-[40px] leading-[1.15] tracking-tight text-paper">
            One master.
            <br />
            Many desks.
          </p>
          <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-muted">
            Positions are copied by reconciliation, not by replaying orders. Add an IB or
            MT5 master, then as many MT5 slaves as you need. A Windows VPS opens a terminal
            for each login.
          </p>
        </div>
        <TickTape />
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-[380px] space-y-5">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-serif)] text-[28px] tracking-tight">
              {mode === "login" ? "Sign in" : "Open an account"}
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {mode === "login"
                ? "Credentials stay on this device only as a session token."
                : "You’ll add trading accounts after this — not on this screen."}
            </p>
          </div>
          <ErrorBanner message={error} />
          {mode === "register" ? (
            <Field label="Full name">
              <TextInput
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </Field>
          ) : null}
          <Field label="Email">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            hint={mode === "register" ? "At least 8 characters." : undefined}
          >
            <TextInput
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </Field>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Working…" : mode === "login" ? "Enter desk" : "Create account"}
          </Button>
          <p className="text-[13px] text-muted">
            {mode === "login" ? (
              <>
                New here?{" "}
                <Link href="/register" className="text-copper hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already registered?{" "}
                <Link href="/login" className="text-copper hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </form>
      </section>
    </div>
  );
}
