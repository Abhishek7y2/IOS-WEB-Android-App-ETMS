'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function MockAuthBanner() {
  const [mockEnabled, setMockEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setMockEnabled(window.localStorage.getItem('use_mock_auth') === 'true');
    setIsVisible(window.localStorage.getItem('hide_mock_auth_banner') !== 'true');
  }, []);

  const toggleMockAuth = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextValue = !mockEnabled;
    window.localStorage.setItem('use_mock_auth', nextValue ? 'true' : 'false');
    setMockEnabled(nextValue);
    window.location.reload();
  };

  const handleDismiss = () => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('hide_mock_auth_banner', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="fixed bottom-4 right-4 z-50 rounded-3xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Dismiss auth stub banner"
      >
        <X className="w-3.5 h-3.5" suppressHydrationWarning />
      </button>
      <div className="flex items-center gap-3 pr-4">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-600">
          Auth stub
        </span>
        <button
          type="button"
          onClick={toggleMockAuth}
          className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          {mockEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
      <p className="mt-2 max-w-xs text-[11px] text-zinc-600 dark:text-zinc-400">
        {mockEnabled
          ? 'Mock authentication is enabled for local testing.'
          : 'Enable mock auth to use local registration/login without a backend.'}
      </p>
    </div>
  );
}
