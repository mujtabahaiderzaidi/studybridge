import { Bookmark, ChevronDown, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useListOpportunities, useToggleOpportunitySaved, getGetDashboardQueryKey, getListOpportunitiesQueryKey } from '@workspace/api-client-react';
import type { Opportunity } from '@workspace/api-client-react';
import { EmptyState, ErrorState, LoadingBlocks, SectionHeading } from '@/components/ui-states';

const types = ['All', 'Fellowship', 'Program', 'Competition', 'Grant'];

function OpportunityCard({ item, onToggle, pending }: { item: Opportunity; onToggle: (id: number) => void; pending: boolean }) {
  return (
    <article className={`group relative rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_hsl(var(--foreground)/.07)] ${item.featured ? 'border-primary/70' : 'border-border/80'}`} data-testid={`card-opportunity-${item.id}`}>
      {item.featured && <div className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-foreground"><Sparkles size={11} /> Featured</div>}
      <div className="flex items-start justify-between gap-4"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">{item.type}</p><h3 className="mt-2 font-display text-xl font-extrabold leading-tight tracking-tight">{item.title}</h3><p className="mt-1 text-sm font-semibold text-muted-foreground">{item.organization}</p></div><button className={`focus-ring grid size-9 shrink-0 place-items-center rounded-xl border transition-all ${item.saved ? 'border-primary/40 bg-primary/15 text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'}`} onClick={() => onToggle(item.id)} disabled={pending} aria-label={item.saved ? `Unsave ${item.title}` : `Save ${item.title}`} data-testid={`button-save-opportunity-${item.id}`}><Bookmark size={17} className={item.saved ? 'fill-current' : ''} /></button></div>
      <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">{item.tags?.map((tag) => <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">{tag}</span>)}</div>
      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs"><span className="text-muted-foreground">Apply by <strong className="font-bold text-foreground">{new Date(item.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span><span className={item.saved ? 'font-bold text-primary-foreground' : 'text-muted-foreground'}>{item.saved ? 'Saved for later' : 'Open opportunity'}</span></div>
    </article>
  );
}

export default function OpportunitiesPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [mobileFilters, setMobileFilters] = useState(false);
  const params = { query: query || undefined, type: type === 'All' ? undefined : type };
  const opportunities = useListOpportunities(params);
  const toggle = useToggleOpportunitySaved();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');

  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2200); return () => window.clearTimeout(timer); }, [notice]);
  const handleToggle = (id: number) => toggle.mutate({ id }, { onSuccess: (updated) => { queryClient.setQueryData<Opportunity[]>(getListOpportunitiesQueryKey(params), (old) => old?.map((item: Opportunity) => item.id === updated.id ? updated : item)); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); setNotice(updated.saved ? 'Opportunity saved to your shortlist.' : 'Opportunity removed from your shortlist.'); }, onError: () => setNotice('That did not save. Please try again.') });

  return (
    <div className="space-y-8">
      <header className="max-w-2xl"><p className="font-mono-ui mb-3 text-[10px] uppercase tracking-[.2em] text-primary">Find your next yes</p><h1 className="font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Good opportunities,<br /><span className="text-secondary-foreground">no tab hoarding.</span></h1><p className="mt-4 text-base leading-relaxed text-muted-foreground">A focused shelf of scholarships, programs, and competitions that reward curious people who follow through.</p></header>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-3 sm:flex-row"><label className="focus-within:ring-2 focus-within:ring-primary/30 flex flex-1 items-center gap-3 rounded-xl bg-muted px-4 py-3"><Search size={18} className="text-muted-foreground" /><input className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, organization, or tag" aria-label="Search opportunities" data-testid="input-search-opportunities" />{query && <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search" data-testid="button-clear-search"><X size={16} /></button>}</label><button className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted sm:hidden" onClick={() => setMobileFilters(!mobileFilters)} data-testid="button-mobile-filters"><SlidersHorizontal size={16} /> Filters <ChevronDown size={15} /></button><div className={`${mobileFilters ? 'flex' : 'hidden'} items-center gap-2 overflow-x-auto sm:flex`} role="group" aria-label="Opportunity type filters">{types.map((option) => <button key={option} className={`focus-ring whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${type === option ? 'bg-sidebar text-sidebar-foreground' : 'text-muted-foreground hover:bg-muted'}`} onClick={() => setType(option)} data-testid={`button-filter-${option.toLowerCase()}`}>{option}</button>)}</div></div>
      {notice && <div className="rise-in fixed bottom-5 right-5 z-50 rounded-xl border border-primary/30 bg-card px-4 py-3 text-sm font-bold shadow-xl" role="status" data-testid="status-save-notice">{notice}</div>}
      <div className="flex items-center justify-between"><SectionHeading eyebrow="Curated for momentum" title={`${opportunities.data?.length ?? 0} opportunities`} /><span className="font-mono-ui hidden text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:block"><SlidersHorizontal size={13} className="mr-1 inline" /> Updated weekly</span></div>
      {opportunities.isLoading ? <div className="grid gap-4 md:grid-cols-2"><LoadingBlocks count={4} /></div> : opportunities.isError ? <ErrorState onRetry={() => opportunities.refetch()} /> : !opportunities.data?.length ? <EmptyState title="Nothing matches that search" detail="Try a broader phrase or browse every category." action={<button className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" onClick={() => { setQuery(''); setType('All'); }} data-testid="button-reset-filters">Reset filters</button>} /> : <div className="grid gap-4 md:grid-cols-2">{opportunities.data.map((item) => <OpportunityCard item={item} key={item.id} onToggle={handleToggle} pending={toggle.isPending} />)}</div>}
    </div>
  );
}