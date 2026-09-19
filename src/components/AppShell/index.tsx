import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOverlay } from '../../hooks/useOverlay';
import { Sidebar } from '../Sidebar/index';
import { Topbar } from '../Topbar/index';

export interface AppShellNavItem {
  to: string;
  label: ReactNode;
  icon?: ReactNode;
}

/** Layout shape: you build the sidebar and topbar yourself. */
export interface AppShellLayoutProps {
  /** Usually a `<Sidebar />`. */
  sidebar: ReactNode;
  /** Usually a `<Topbar onMenu={…} />` whose menu button sets `sidebarOpen`. */
  topbar: ReactNode;
  children: ReactNode;
  /** Small screens only: sidebar slid in over the page. Close it after navigating. */
  sidebarOpen?: boolean;
  onSidebarClose?: () => void;
  className?: string;
}

/** Console shape: route list in, shell builds `Sidebar` + `Topbar` (needs a react-router context). */
export interface AppShellConsoleProps {
  brand: ReactNode;
  nav: AppShellNavItem[];
  userLabel: string;
  onLogout: () => void;
  children: ReactNode;
  className?: string;
}

export type AppShellProps = AppShellLayoutProps | AppShellConsoleProps;

/**
 * The authenticated shell every console screen renders inside: fixed sidebar, sticky topbar,
 * content. Under `lg` the sidebar is off-canvas — Escape or a backdrop click closes it.
 *
 * Two call shapes: pass `sidebar`/`topbar` elements, or pass `brand`/`nav`/`userLabel`/`onLogout`
 * and the shell builds them for you.
 */
export function AppShell(props: AppShellProps) {
  if ('nav' in props) return <ConsoleShell {...props} />;
  return <LayoutShell {...props} />;
}

function LayoutShell({
  sidebar,
  topbar,
  children,
  sidebarOpen = false,
  onSidebarClose = () => {},
  className = '',
}: AppShellLayoutProps) {
  const ref = useOverlay<HTMLDivElement>(sidebarOpen, onSidebarClose);
  return (
    <div className={`grid min-h-screen bg-page text-fg lg:grid-cols-[16rem_1fr] ${className}`}>
      <div
        ref={ref}
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={onSidebarClose} />
      ) : null}
      <div className="flex min-w-0 flex-col">
        {topbar}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function ConsoleShell({ brand, nav, userLabel, onLogout, children, className }: AppShellConsoleProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active =
    nav.find((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))?.to ?? nav[0]?.to ?? '';

  return (
    <LayoutShell
      className={className}
      sidebarOpen={open}
      onSidebarClose={() => setOpen(false)}
      sidebar={
        <Sidebar
          brand={brand}
          groups={[{ items: nav.map((i) => ({ key: i.to, label: i.label, icon: i.icon })) }]}
          activeKey={active}
          onSelect={(to) => {
            setOpen(false);
            navigate(to);
          }}
        />
      }
      topbar={
        <Topbar
          title={userLabel}
          onMenu={() => setOpen(true)}
          actions={
            <button
              type="button"
              onClick={onLogout}
              className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Log out
            </button>
          }
        />
      }
    >
      {children}
    </LayoutShell>
  );
}
