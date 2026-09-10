"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="text-[12px] leading-snug text-faint">{hint}</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-[2px] border border-line bg-ink px-3 py-2.5 text-[14px] text-paper outline-none transition placeholder:text-faint focus:border-copper";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Button({
  children,
  tone = "copper",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "copper" | "ghost" | "danger";
}) {
  const tones = {
    copper:
      "bg-copper text-ink hover:bg-[#d4b88a] disabled:bg-line disabled:text-faint",
    ghost:
      "border border-line bg-transparent text-paper hover:border-copper hover:text-copper",
    danger: "border border-danger/40 bg-transparent text-down hover:bg-danger/10",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-[2px] px-4 py-2.5 text-[13px] font-medium tracking-wide transition disabled:cursor-not-allowed ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-down"
    >
      {message}
    </p>
  );
}
