import { AlertCircle, ArrowUpRight, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingBlocks({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" data-testid="state-loading">
      {Array.from({ length: count }).map((_, index) => <div key={index} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );
}

export function ErrorState({ onRetry, label = 'We could not load this just now.' }: { onRetry?: () => void; label?: string }) {
  return (
    <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5" data-testid="state-error">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 text-destructive" size={19} />
        <div>
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">Give it another moment, then try again.</p>
          {onRetry && <button className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg border border-destructive/25 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10" onClick={onRetry} data-testid="button-retry"><RefreshCw size={13} /> Retry</button>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center" data-testid="state-empty">
      <div className="mx-auto mb-4 grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><ArrowUpRight size={19} /></div>
      <p className="font-display text-lg font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="font-mono-ui mb-2 text-[10px] uppercase tracking-[.18em] text-primary">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
        {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
      </div>
      {action}
    </div>
  );
}