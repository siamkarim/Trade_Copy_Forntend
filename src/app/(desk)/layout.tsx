import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";

export default function DeskLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
