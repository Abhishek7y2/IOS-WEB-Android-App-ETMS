'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [isMock, setIsMock] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMock(window.localStorage.getItem('use_mock_auth') === 'true');
      const savedCollapse = window.localStorage.getItem('sidebar_collapsed');
      if (savedCollapse === 'true') {
        setIsCollapsed(true);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      window.localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.designation?.toLowerCase() === 'admin' || user?.designation?.toLowerCase() === 'ceo' || user?.designation?.toLowerCase() === 'project manager';

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: isAdmin ? 'Task Manager' : 'Task List',
      href: '/tasks',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: isAdmin ? 'Team Member Manager' : 'Team Members',
      href: '/employees',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Chatbot',
      href: '/chatbot',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: 'Communication',
      href: '/communication',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.04 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: isAdmin ? 'Attendance Manager' : 'Attendance',
      href: '/attendance',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: isAdmin ? 'Leave Manager' : 'Leave',
      href: '/leave',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    },
  ];

  if (isAdmin) {
    navigation.push({
      name: 'Archive',
      href: '/archive',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    });

    navigation.push({
      name: 'Document RAG',
      href: '/chatbot?view=rag',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    });
  }

  // Add Settings at the very end for all users
  navigation.push({
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  });

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex-col justify-between
        border-r border-zinc-200/40 bg-white/60 py-6 
        dark:border-zinc-800/50 dark:bg-zinc-900/60 
        backdrop-blur-xl transition-all duration-300 ease-in-out
        md:relative md:flex md:translate-x-0 shadow-lg shadow-zinc-200/20 dark:shadow-black/20
        ${isOpen ? 'flex translate-x-0' : '-translate-x-full md:translate-x-0 hidden'}
        ${isCollapsed ? 'w-20 px-3' : 'w-64 px-4'}
      `}>
        {/* Floating Toggle Button */}
        <button 
          onClick={toggleCollapse} 
          className="absolute -right-3 top-7 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-all hover:scale-110 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-50 z-50 ring-4 ring-zinc-50/50 dark:ring-zinc-950/50"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="space-y-6">
          <div className="px-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-black dark:text-white whitespace-nowrap overflow-hidden h-6 flex items-center">
            {!isCollapsed && "Workspace"}
          </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = (() => {
              if (item.name === 'Document RAG') {
                return pathname === '/chatbot' && searchParams.get('view') === 'rag';
              }
              if (item.name === 'Chatbot') {
                return pathname === '/chatbot' && searchParams.get('view') !== 'rag';
              }
              return pathname === item.href;
            })();
            
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'} rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 border-l-2 ${isActive
                    ? 'bg-zinc-100/80 text-black border-blue-600 dark:bg-zinc-900/60 dark:text-white dark:border-blue-500 font-bold shadow-sm'
                    : 'text-black hover:bg-zinc-50 hover:text-black border-transparent dark:text-white dark:hover:bg-zinc-900/30 dark:hover:text-white'
                  }`}
              >
                <span className={isActive ? 'text-blue-600 dark:text-blue-400 shrink-0' : 'text-black group-hover:text-black dark:text-white dark:group-hover:text-white shrink-0'}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-200/60 pt-4 dark:border-zinc-800/65">
        <button
          onClick={logout}
          title={isCollapsed ? "Log Out" : undefined}
          className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'} w-full rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 border-l-2 border-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 hover:text-red-700 dark:hover:text-red-400 mb-2.5 cursor-pointer`}
        >
          <span className="shrink-0 text-red-500 group-hover:text-red-650 dark:group-hover:text-red-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Log Out</span>}
        </button>
        {isCollapsed ? (
          <div className="flex justify-center" title={`Mode: ${isMock ? 'Local Mock' : 'Server API'}`}>
            <div className="p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-500 border border-zinc-200/60 dark:border-zinc-800/40">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-[11px] text-zinc-600 dark:border-zinc-800/40 dark:bg-zinc-900/20 dark:text-zinc-400 overflow-hidden whitespace-nowrap">
            <p className="font-bold text-zinc-800 dark:text-zinc-300">
              Mode: <span className="text-blue-600 dark:text-blue-400">{isMock ? 'Local Mock' : 'Server API'}</span>
            </p>
            <p className="mt-1 leading-relaxed truncate whitespace-normal">
              {isMock
                ? 'Changes are saved locally.'
                : 'Connected to MongoDB backend.'}
            </p>
          </div>
        )}
        </div>
      </aside>
    </>
  );
};

