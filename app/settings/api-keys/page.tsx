'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Shield } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ApiKeysPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/litmusai_email=([^;]+)/);
    setEmail(match ? decodeURIComponent(match[1]) : '');
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      toast.error('API key is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), api_key: trimmedKey }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.detail ?? 'Could not update API key');
        return;
      }

      toast.success('API key updated for this session');
      setApiKey('');
      setShowKey(false);
      router.refresh();
    } catch {
      toast.error('Network error while updating key');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar title="API Keys" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-4">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Settings
          </Link>

          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <KeyRound size={16} className="text-slate-300" />
                Replace Session API Key
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Enter a new key to update authentication for all dashboard API requests.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="settings-email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-api-key" className="text-sm font-medium text-slate-300">
                  New API Key
                </label>
                <div className="relative">
                  <Input
                    id="settings-api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="lmai_..."
                    autoComplete="off"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Save API Key
              </Button>
            </form>
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield size={14} className="text-slate-300" />
              Security
            </h3>
            <p className="text-sm text-slate-400">
              Your current key is intentionally not readable from this page. Keys are stored in a secure HTTP-only cookie.
            </p>
            <p className="text-sm text-slate-400">
              Rotate keys regularly and remove old keys from your backend to reduce credential risk.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
