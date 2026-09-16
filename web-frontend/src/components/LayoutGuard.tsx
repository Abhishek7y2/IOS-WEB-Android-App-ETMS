'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutGuardProps {
  children: React.ReactNode;
}

export const LayoutGuard: React.FC<LayoutGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, initializing, loading } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!initializing && !isAuthenticated && !isAuthPage) {
      router.replace('/login');
      // Fallback for mobile browsers if client-side router.replace stumbles
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, initializing, isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-8 py-6 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-8 py-6 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const isChatbotPage = pathname.startsWith('/chatbot');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950 relative">
      {/* Dynamic Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-lighten animate-pulse opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-lighten opacity-60" />
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-purple-400/15 dark:bg-purple-600/15 blur-[80px] mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <div className="flex h-screen flex-col overflow-hidden relative z-10 w-full">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar with Suspense for useSearchParams */}
        <React.Suspense fallback={<div className="w-64 flex-none bg-white dark:bg-zinc-950 border-r border-zinc-200/40 dark:border-zinc-800/50" />}>
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </React.Suspense>
          <main className={`flex-1 transition-colors duration-300 bg-transparent ${isChatbotPage ? 'p-0 overflow-hidden' : 'p-4 md:p-8 overflow-y-auto custom-scrollbar'}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
