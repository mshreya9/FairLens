"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { POLICY_VERSION } from "@/lib/policy-data";

const NAV_ITEMS = [
  { href: "/review", label: "Review", description: "Run a governance assessment" },
  { href: "/presentation", label: "Presentation", description: "Class demo, one page" },
  { href: "/guide", label: "Guide", description: "How to use this tool" },
  { href: "/policy", label: "Policy", description: "Bank fairness and governance policy" },
  { href: "/methodology", label: "Methodology", description: "How the agent assesses fairness" },
  { href: "/testing", label: "Testing", description: "Synthetic scenarios and validation" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href === "/review" && pathname === "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-light)] text-white shadow-md"
                    : "text-[var(--color-text-secondary)] hover:translate-x-0.5 hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    active ? "bg-white" : "bg-[var(--color-border-strong)]"
                  }`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
        FairLens is a governance decision-support prototype using synthetic data. It supports
        the Complaints Head. It does not replace managerial judgement.
      </div>

      <div className="mt-3 px-3 text-[11px] text-[var(--color-text-muted)]">
        Current version: {POLICY_VERSION}, see VERSION_LOG.md
      </div>
    </nav>
  );
}
