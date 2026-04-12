'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheck, CircleX, KeyRound, Loader2, LogOut, UserRound } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';

type HealthState = 'checking' | 'ok' | 'error';

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [health, setHealth] = useState<HealthState>('checking');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/litmusai_email=([^;]+)/);
    setEmail(match ? decodeURIComponent(match[1]) : '');

    let mounted = true;
    fetch('/api/v1/health', { cache: 'no-store' })
      .then((res) => {
        if (!mounted) return;
        setHealth(res.ok ? 'ok' : 'error');
      })
      .catch(() => {
        if (!mounted) return;
        setHealth('error');
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-4">
          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <UserRound size={16} className="text-slate-300" />
                  Account
                </h2>
                <p className="text-sm text-slate-400 mt-1">Session details for this workspace.</p>
              </div>
              <HealthBadge state={health} />
            </div>

            <div className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Signed in email</p>
              <p className="text-sm text-white break-all">{email || 'Not set'}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/settings/api-keys"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                <KeyRound size={14} />
                Manage API Key
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-slate-300 hover:text-red-300 border border-slate-600"
              >
                {signingOut ? <Loader2 size={14} className="animate-spin mr-1" /> : <LogOut size={14} className="mr-1" />}
                Sign Out
              </Button>
            </div>
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-2">
            <h2 className="text-base font-semibold text-white">Security Notes</h2>
            <p className="text-sm text-slate-400">
              API keys are stored in an HTTP-only session cookie. This improves security by keeping the key out of browser-accessible JavaScript.
            </p>
            <p className="text-sm text-slate-400">
              If you need to rotate credentials, open API Keys and replace the key used for this session.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

function HealthBadge({ state }: { state: HealthState }) {
  if (state === 'checking') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300">
        <Loader2 size={12} className="animate-spin" />
        Checking backend
      </span>
    );
  }

  if (state === 'ok') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CircleCheck size={12} />
        Backend reachable
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
      <CircleX size={12} />
      Backend unavailable
    </span>
  );
}
