import { POLICY_VERSION } from "@/lib/policy-data";

export default function Header() {
  return (
    <header className="relative z-10 bg-gradient-to-r from-[var(--color-navy)] to-[#1b3157] text-white shadow-[0_2px_8px_rgba(16,20,28,0.18)]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-gradient-to-br from-white/20 to-white/5 text-sm font-bold shadow-inner">
            FL
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-bold tracking-wide text-white">
              FairLens
            </div>
            <div className="text-[11px] text-white/60">
              Complaint Prioritisation Fairness Review Agent
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/70">
          <span className="rounded border border-white/20 px-2 py-1">
            Prototype &middot; Synthetic Data
          </span>
          <span className="rounded border border-white/20 px-2 py-1">
            Policy {POLICY_VERSION}
          </span>
        </div>
      </div>
    </header>
  );
}
