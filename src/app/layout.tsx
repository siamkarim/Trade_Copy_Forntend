import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "TradeCopy",
  description: "Copy IB or MT5 masters to many MT5 slave accounts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-paper antialiased">{children}</body>
    </html>
  );
}
