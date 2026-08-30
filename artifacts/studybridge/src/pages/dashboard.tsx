import { ArrowRight, Check, Clock3, Flame, Bookmark, Target, Users } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboard, useListActivity, useListOpportunities, useListSessions } from '@workspace/api-client-react';
import type { Activity, Opportunity, StudySession } from '@workspace/api-client-react';
import { EmptyState, ErrorState, LoadingBlocks, SectionHeading } from '@/components/ui-states';

function formatTime(date: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}

function relativeTime(date: string) {
  const delta = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

function Metric({ label, value, suffix, icon: Icon, tone }: { label: string; value: number; suffix?: string; icon: typeof Flame; tone: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_2px_0_hsl(var(--foreground)/.03)] transition-transform duration-200 hover:-translate-y-0.5" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="flex items-center justify-between"><span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon size={17} /></span><span className="font-mono-ui text-[10px] text-muted-foreground">THIS TERM</span></div>
      <p className="mt-5 font-display text-3xl font-extrabold tracking-tight">{value}<span className="ml-1 text-base font-semibold text-muted-foreground">{suffix}</span></p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function SessionsPreview({ sessions, isLoading, isError, retry }: { sessions?: StudySession[]; isLoading: boolean; isError: boolean; retry: () => void }) {
  return (
    <section>
      <SectionHeading eyebrow="Shared focus" title="Next on your calendar" detail="A little structure goes a long way." action={<Link href="/sessions" className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-secondary-foreground hover:text-primary" data-testid="link-view-sessions">View all <ArrowRight size={15} /></Link>} />
      {isLoading ? <LoadingBlocks count={2} /> : isError ? <ErrorState onRetry={retry} /> : !sessions?.length ? <EmptyState title="Your calendar has room" detail="Create a session and invite your future self." action={<Link href="/sessions" className="focus-ring inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" data-testid="link-create-first-session">Plan a session</Link>} /> : (
        <div className="grid gap-3">
          {sessions.slice(0, 3).map((session) => <div className="group flex items-center gap-4 rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/50" key={session.id} data-testid={`card-session-${session.id}`}>
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${session.status === 'live' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}><Clock3 size={18} /></div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-bold">{session.title}</p>{session.status === 'live' && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary-foreground">Live</span>}</div><p className="mt-1 text-xs text-muted-foreground">{session.subject} · {formatTime(session.scheduledAt)}</p></div>
            <div className="hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:flex"><Users size={14} /> {session.participantCount}</div>
            <span className="font-mono-ui text-xs text-muted-foreground">{session.durationMinutes}m</span>
          </div>)}
        </div>
      )}
    </section>
  );
}

function OpportunityPreview({ opportunities, isLoading, isError, retry }: { opportunities?: Opportunity[]; isLoading: boolean; isError: boolean; retry: () => void }) {
  return (
    <section>
      <SectionHeading eyebrow="Worth a look" title="Opportunity radar" detail="Hand-picked places to put your work in motion." action={<Link href="/opportunities" className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-secondary-foreground hover:text-primary" data-testid="link-view-opportunities">Explore all <ArrowRight size={15} /></Link>} />
      {isLoading ? <LoadingBlocks count={2} /> : isError ? <ErrorState onRetry={retry} /> : !opportunities?.length ? <EmptyState title="No opportunities yet" detail="Check back soon for programs, prizes, and places to grow." /> : (
        <div className="space-y-3">{opportunities.slice(0, 3).map((opportunity) => <Link href="/opportunities" className="focus-ring block rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50" key={opportunity.id} data-testid={`card-opportunity-${opportunity.id}`}>
          <div className="flex items-start justify-between gap-3"><div><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-primary">{opportunity.type}</span><p className="mt-1 font-bold leading-snug">{opportunity.title}</p><p className="mt-1 text-xs text-muted-foreground">{opportunity.organization}</p></div><Bookmark size={17} className={opportunity.saved ? 'fill-primary text-primary' : 'text-muted-foreground/50'} /></div>
          <div className="mt-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">Deadline {new Date(opportunity.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span><span className="font-semibold text-secondary-foreground">{opportunity.tags?.[0]}</span></div>
        </Link>)}</div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const dashboard = useGetDashboard();
  const sessions = useListSessions();
  const opportunities = useListOpportunities();
  const activity = useListActivity();
  const progress = dashboard.data ? Math.min(100, Math.round((dashboard.data.weeklyMinutes / Math.max(1, dashboard.data.weeklyGoalMinutes)) * 100)) : 0;

  if (dashboard.isLoading) return <div className="space-y-8"><div className="space-y-3"><div className="skeleton h-4 w-24 rounded" /><div className="skeleton h-12 w-96 max-w-full rounded-xl" /><div className="skeleton h-5 w-80 max-w-full rounded" /></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><LoadingBlocks count={4} /></div></div>;
  if (dashboard.isError || !dashboard.data) return <ErrorState onRetry={() => dashboard.refetch()} label="Your progress overview is taking a pause." />;

  return (
    <div className="space-y-10">
      <header className="rise-in flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><p className="font-mono-ui mb-3 text-[10px] uppercase tracking-[.2em] text-primary">Good morning, Alex</p><h1 className="font-display max-w-xl text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Make today <span className="text-secondary-foreground">count</span>, quietly.</h1><p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">You have a clear runway. Keep the promise you made to yourself this week.</p></div>
        <Link href="/sessions" className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/.2)] transition-transform hover:-translate-y-0.5" data-testid="link-start-focus"><Target size={17} /> Start a focus session <ArrowRight size={15} /></Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Day streak" value={dashboard.data.streak} suffix="days" icon={Flame} tone="bg-primary/15 text-primary-foreground" />
        <Metric label="Focus minutes" value={dashboard.data.focusMinutes} suffix="min" icon={Clock3} tone="bg-secondary text-secondary-foreground" />
        <Metric label="Sessions completed" value={dashboard.data.sessionsCompleted} icon={Check} tone="bg-accent text-accent-foreground" />
        <Metric label="Opportunities saved" value={dashboard.data.opportunitiesSaved} icon={Bookmark} tone="bg-primary/15 text-primary-foreground" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary">Weekly rhythm</p><h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight">Progress you can see</h2><p className="mt-1 text-sm text-muted-foreground">Your focus time, measured without the noise.</p></div><span className="font-mono-ui text-2xl font-bold text-secondary-foreground">{progress}%</span></div>
          <div className="mt-8 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} /></div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{dashboard.data.weeklyMinutes} min logged</span><span>{dashboard.data.weeklyGoalMinutes} min goal</span></div>
          <div className="mt-8 grid grid-cols-7 gap-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`} className="text-center"><div className={`mx-auto mb-2 h-16 w-full max-w-8 rounded-lg ${index < 4 ? 'bg-secondary' : index === 4 ? 'bg-primary' : 'bg-muted'}`} style={{ opacity: index < 4 ? .55 + index * .1 : 1 }} /><span className="font-mono-ui text-[10px] text-muted-foreground">{day}</span></div>)}</div>
        </div>
        <div className="rounded-2xl border border-sidebar-border bg-sidebar p-6 text-sidebar-foreground sm:p-7"><div className="flex items-center justify-between"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary">Recent activity</p><span className="size-2 rounded-full bg-primary" /></div>{activity.isLoading ? <div className="mt-6"><LoadingBlocks count={3} /></div> : activity.isError ? <div className="mt-5"><ErrorState onRetry={() => activity.refetch()} /></div> : !activity.data?.length ? <div className="mt-6"><p className="text-sm text-sidebar-foreground/60">Your first small win will show up here.</p></div> : <div className="mt-6 space-y-5">{activity.data.slice(0, 4).map((item: Activity) => <div className="flex gap-3" key={item.id} data-testid={`activity-${item.id}`}><div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><p className="text-sm leading-snug text-sidebar-foreground/85"><strong className="font-bold text-sidebar-foreground">{item.actor}</strong> {item.action}</p><p className="mt-1 truncate text-xs text-sidebar-foreground/45">{item.detail} · {relativeTime(item.createdAt)}</p></div></div>)}</div>}</div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[1.1fr_1fr]">
        <SessionsPreview sessions={sessions.data} isLoading={sessions.isLoading} isError={sessions.isError} retry={() => sessions.refetch()} />
        <OpportunityPreview opportunities={opportunities.data} isLoading={opportunities.isLoading} isError={opportunities.isError} retry={() => opportunities.refetch()} />
      </div>
    </div>
  );
}