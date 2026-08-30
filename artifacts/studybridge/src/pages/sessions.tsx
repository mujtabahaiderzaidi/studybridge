import { CalendarPlus, Check, Clock3, Plus, Users, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCompleteSession, useCreateSession, useListSessions, getGetDashboardQueryKey, getListActivityQueryKey, getListSessionsQueryKey } from '@workspace/api-client-react';
import type { SessionInput, StudySession } from '@workspace/api-client-react';
import { EmptyState, ErrorState, LoadingBlocks } from '@/components/ui-states';

const initialForm: SessionInput = { title: '', subject: '', durationMinutes: 50, scheduledAt: '' };

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function SessionCard({ session, onComplete, pending }: { session: StudySession; onComplete: (id: number) => void; pending: boolean }) {
  const completed = session.status === 'completed';
  return (
    <article className={`rounded-2xl border bg-card p-5 ${completed ? 'border-border/60 opacity-75' : 'border-border/80'}`} data-testid={`card-session-${session.id}`}>
      <div className="flex items-start gap-4"><div className={`grid size-11 shrink-0 place-items-center rounded-xl ${session.status === 'live' ? 'bg-primary text-primary-foreground' : completed ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground'}`}>{completed ? <Check size={19} /> : <Clock3 size={19} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-extrabold leading-tight">{session.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${session.status === 'live' ? 'bg-primary/20 text-primary-foreground' : session.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground'}`}>{session.status}</span></div><p className="mt-1 text-sm text-muted-foreground">{session.subject}</p></div></div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground"><span><CalendarPlus size={14} className="mr-1.5 inline text-primary" />{formatTime(session.scheduledAt)}</span><span><Users size={14} className="mr-1.5 inline text-primary" />{session.participantCount} participants</span></div>
      <div className="mt-4 flex items-center justify-between"><span className="font-mono-ui text-xs text-muted-foreground">{session.durationMinutes} min focus</span>{!completed && <button className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary hover:text-primary" onClick={() => onComplete(session.id)} disabled={pending} data-testid={`button-complete-session-${session.id}`}><Check size={14} /> Mark complete</button>}</div>
    </article>
  );
}

export default function SessionsPage() {
  const sessions = useListSessions();
  const create = useCreateSession();
  const complete = useCompleteSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SessionInput>(initialForm);
  const [formError, setFormError] = useState('');
  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const visible = sessions.data?.filter((session) => tab === 'all' || (tab === 'completed' ? session.status === 'completed' : session.status !== 'completed'));

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.subject.trim() || !form.scheduledAt) { setFormError('Add a title, subject, and time before saving.'); return; }
    setFormError('');
    create.mutate({ data: { ...form, title: form.title.trim(), subject: form.subject.trim(), durationMinutes: Number(form.durationMinutes), scheduledAt: new Date(form.scheduledAt).toISOString() } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); setShowForm(false); setForm(initialForm); }, onError: () => setFormError('We could not create that session. Try again in a moment.') });
  };

  const handleComplete = (id: number) => complete.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() }); } });

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="font-mono-ui mb-3 text-[10px] uppercase tracking-[.2em] text-primary">Make space for focus</p><h1 className="font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Study together,<br /><span className="text-secondary-foreground">show up for yourself.</span></h1><p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Quiet rooms, clear intentions, and a small group of people doing the same brave thing.</p></div><button className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/.2)] transition-transform hover:-translate-y-0.5" onClick={() => setShowForm(true)} data-testid="button-create-session"><Plus size={18} /> Create a session</button></header>
      <div className="flex gap-1 border-b border-border/80"><button className={`focus-ring border-b-2 px-3 py-3 text-sm font-bold ${tab === 'all' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`} onClick={() => setTab('all')} data-testid="button-tab-all">All sessions</button><button className={`focus-ring border-b-2 px-3 py-3 text-sm font-bold ${tab === 'upcoming' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`} onClick={() => setTab('upcoming')} data-testid="button-tab-upcoming">Upcoming</button><button className={`focus-ring border-b-2 px-3 py-3 text-sm font-bold ${tab === 'completed' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`} onClick={() => setTab('completed')} data-testid="button-tab-completed">Completed</button></div>
      {sessions.isLoading ? <div className="grid gap-4 md:grid-cols-2"><LoadingBlocks count={4} /></div> : sessions.isError ? <ErrorState onRetry={() => sessions.refetch()} /> : !visible?.length ? <EmptyState title={tab === 'completed' ? 'No completed sessions yet' : 'A clear calendar is a good start'} detail={tab === 'completed' ? 'Your finished focus blocks will collect here.' : 'Create a room for the next thing you want to make real.'} action={tab !== 'completed' && <button className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" onClick={() => setShowForm(true)} data-testid="button-empty-create-session">Create a session</button>} /> : <div className="grid gap-4 md:grid-cols-2">{visible.map((session) => <SessionCard key={session.id} session={session} onComplete={handleComplete} pending={complete.isPending} />)}</div>}

      {showForm && <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/65 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Create a study session"><div className="w-full max-w-lg rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary">New focus block</p><h2 className="mt-2 font-display text-2xl font-extrabold">Set an intention</h2></div><button className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted" onClick={() => setShowForm(false)} aria-label="Close create session" data-testid="button-close-session-form"><X size={19} /></button></div><form className="mt-6 space-y-4" onSubmit={handleCreate}><label className="block text-sm font-bold">Session title<input className="focus-ring mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Finish biology review" data-testid="input-session-title" /></label><label className="block text-sm font-bold">Subject<input className="focus-ring mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="e.g. Biology" data-testid="input-session-subject" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Duration<select className="focus-ring mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} data-testid="select-session-duration"><option value={25}>25 minutes</option><option value={50}>50 minutes</option><option value={90}>90 minutes</option><option value={120}>120 minutes</option></select></label><label className="block text-sm font-bold">Starts at<input type="datetime-local" className="focus-ring mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} data-testid="input-session-time" /></label></div>{formError && <p className="text-sm font-semibold text-destructive" role="alert" data-testid="text-session-error">{formError}</p>}<button className="focus-ring mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sidebar px-4 py-3.5 text-sm font-bold text-sidebar-foreground disabled:opacity-50" disabled={create.isPending} data-testid="button-submit-session">{create.isPending ? 'Creating…' : 'Create focus session'} <Plus size={16} /></button></form></div></div>}
    </div>
  );
}