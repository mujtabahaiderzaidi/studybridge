import { BookOpen, Compass, Info, LayoutDashboard, Menu, Sparkles, Users, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const navigation = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/opportunities', label: 'Opportunities', icon: Compass },
  { href: '/sessions', label: 'Study sessions', icon: Users },
  { href: '/about', label: 'About StudyBridge', icon: Info },
];

function Brand() {
  return (
    <Link href="/" className="focus-ring flex items-center gap-3" data-testid="link-brand">
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_18px_hsl(var(--primary)/.22)]">
        <BookOpen size={20} strokeWidth={2.5} />
      </span>
      <span>
        <span className="font-display block text-[17px] font-extrabold tracking-tight text-sidebar-foreground">StudyBridge</span>
        <span className="font-mono-ui block text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/50">steady progress</span>
      </span>
    </Link>
  );
}

export function StudyBridgeShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 lg:flex">
        <Brand />
        <div className="mt-14">
          <p className="font-mono-ui mb-3 px-3 text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/40">Your workspace</p>
          <nav className="space-y-1" aria-label="Primary navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`focus-ring group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'}`}
                  data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <Icon size={18} className={active ? 'text-primary' : 'text-sidebar-foreground/45 group-hover:text-primary'} />
                  {item.label}
                  {item.href === '/opportunities' && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Sparkles size={16} className="text-primary" />
            <span className="font-mono-ui text-[10px] text-sidebar-foreground/40">TIP 01</span>
          </div>
          <p className="font-display text-sm font-bold leading-snug text-sidebar-foreground">Small proof, repeated often, becomes momentum.</p>
          <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/50">Your dashboard keeps the receipts.</p>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-sidebar/70 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="h-full w-[280px] border-r border-sidebar-border bg-sidebar px-5 py-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Brand />
              <button className="focus-ring rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-12 space-y-1" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/60'}`} data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}>
                    <Icon size={18} /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
          <button className="focus-ring rounded-xl border border-border bg-card p-2.5 text-foreground lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu">
            <Menu size={19} />
          </button>
          <div className="hidden text-sm text-muted-foreground sm:block">{location === '/' ? 'Tuesday, 14 October 2025' : 'StudyBridge workspace'}</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex">Autumn term · Week 7</span>
            <button className="focus-ring grid size-9 place-items-center rounded-full bg-secondary text-xs font-extrabold text-secondary-foreground transition-transform hover:scale-105" aria-label="Open profile" data-testid="button-profile">AM</button>
          </div>
        </header>
        <main className="page-shell mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">{children}</main>
      </div>
    </div>
  );
}