"use client";

interface Props {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function ReviewButton({ onClick, loading, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-light)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {loading ? "Running Governance Review…" : "Run Governance Review"}
    </button>
  );
}
