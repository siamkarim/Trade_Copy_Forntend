"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Wordmark } from "@/components/Wordmark";
import { api, clearSession, getToken, type User } from "@/lib/api";

const NAV = [
  { href: "/overview", label: "Overview" },
  { href: "/accounts", label: "Accounts" },
  { href: "/rules", label: "Copy rules" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        clearSession();
        router.replace("/login");
      })
      .finally(() => setReady(true));
  }, [router]);

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-muted">
        Opening desk…
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <Wordmark />
          <p className="hidden pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-faint md:block">
            Desk
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-8">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-[13px] ${
                  active
                    ? "border-l-2 border-copper bg-raised text-paper"
                    : "border-l-2 border-transparent text-muted hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-line px-5 py-4 md:block">
          <p className="truncate text-[13px] text-paper">{user.full_name || user.email}</p>
          <p className="truncate font-mono text-[11px] text-faint">{user.email}</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 text-[12px] text-muted underline-offset-4 hover:text-copper hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line px-5 py-3 md:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Copy desk
          </p>
          <div className="flex items-center gap-4">
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                user.kill_switch ? "text-down" : "text-up"
              }`}
            >
              {user.kill_switch ? "Kill switch on" : "Live"}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="text-[12px] text-muted md:hidden"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
