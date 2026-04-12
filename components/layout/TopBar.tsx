'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, ChevronDown, LogOut, User, Copy, Check, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface TopBarProps {
  title?: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, children }: TopBarProps) {
  const router = useRouter();
  const [apiKeyOpen, setApiKeyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const match = document.cookie.match(/litmusai_email=([^;]+)/);
    setEmail(match ? decodeURIComponent(match[1]) : '');
  }, []);

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white md:hidden">
            <Menu size={20} />
          </button>
          {title && <h1 className="text-sm font-semibold text-white">{title}</h1>}
          {children}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setApiKeyOpen(true)}
            className="text-slate-400 hover:text-white text-xs gap-1.5"
          >
            <Key size={14} />
            API Key
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white">
                {email.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
              <div className="px-3 py-2">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-medium truncate max-w-[200px]">{email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={() => setApiKeyOpen(true)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <Key size={14} className="mr-2" /> API Keys
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                <LogOut size={14} className="mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* API Key Sheet */}
      <Sheet open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <SheetContent className="bg-slate-800 border-slate-700 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">API Key</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-400">
              Your API key is used to authenticate requests. Keep it secret.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700 rounded-md px-3 py-2 text-sm font-mono text-slate-300 truncate">
                lmai_••••••••••••••••
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
