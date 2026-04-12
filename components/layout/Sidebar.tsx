'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, History, Settings, Key, LogOut, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRuns } from '@/hooks/useRuns';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Projects', icon: <LayoutDashboard size={16} />, exact: true },
  { href: '/dashboard?tab=history', label: 'Run History', icon: <History size={16} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { runs } = useRuns();

  const recentRuns = runs.slice(0, 5);

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href.split('?')[0];
    return pathname.startsWith(href.split('?')[0]);
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <Link href="/dashboard">
          <Image src="/litmusai-logo.svg" alt="LitmusAI" width={130} height={30} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Dashboard
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-slate-700 text-white border-l-2 border-emerald-500 pl-[6px]'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {/* Recent Runs */}
        {recentRuns.length > 0 && (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mt-4">
              Recent Runs
            </p>
            {recentRuns.map((run) => {
              const href =
                run.status === 'complete'
                  ? `/runs/${run.run_id}/report`
                  : `/runs/${run.run_id}`;
              return (
                <Link
                  key={run.run_id}
                  href={href}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Circle
                    size={6}
                    className={cn(
                      'fill-current flex-shrink-0',
                      run.status === 'running' || run.status === 'evaluating'
                        ? 'text-blue-400 animate-pulse'
                        : run.status === 'complete'
                        ? 'text-emerald-500'
                        : run.status === 'failed'
                        ? 'text-red-500'
                        : 'text-slate-500'
                    )}
                  />
                  <span className="truncate">{run.run_id.slice(-8)}</span>
                  {run.score != null && (
                    <span
                      className={cn(
                        'ml-auto text-xs font-medium',
                        run.score >= 70
                          ? 'text-emerald-500'
                          : run.score >= 50
                          ? 'text-amber-500'
                          : 'text-red-500'
                      )}
                    >
                      {run.score}
                    </span>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-slate-700 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <Settings size={16} /> Settings
        </Link>
        <Link
          href="/settings/api-keys"
          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <Key size={16} /> API Keys
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-sm text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
