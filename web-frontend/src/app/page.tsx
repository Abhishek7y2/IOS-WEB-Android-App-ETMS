'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, BarChart3, CheckCircle2, CircleDashed, Clock3, ClipboardList, ListTodo, TimerReset, Users, MessageSquare, Megaphone, Inbox } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTasks } from '../context/TaskContext';
import { TaskSummaryCard } from '../components/task/TaskSummaryCard';
import { EmployeeCard } from '../components/employee/EmployeeCard';
import { KPICard } from '../components/analytics/KPICard';

const PieChartCard = dynamic(() => import('../components/analytics/PieChartCard').then((mod) => mod.PieChartCard), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 animate-pulse border border-zinc-200/50 dark:border-zinc-800/50" />,
});

const BarChartCard = dynamic(() => import('../components/analytics/BarChartCard').then((mod) => mod.BarChartCard), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/60 animate-pulse border border-zinc-200/50 dark:border-zinc-800/50" />,
});
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/task/StatusBadge';
import { formatDate } from '../utils/format';
import { getDashboardMetrics, getRecentActivities, getRecentTasks } from '../utils/dashboardUtils';
import { useCommunication } from '../context/CommunicationContext';
import { ActivityLog } from '../types';

const activityMessages: Record<ActivityLog['action'], string> = {
  created: 'created',
  updated: 'updated',
  status_changed: 'changed status for',
  deleted: 'deleted',
};

import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { tasks, employees, activities } = useTasks();
  const { user } = useAuth();
  const { conversations, announcements, unreadMessageCount, unreadNotificationCount } = useCommunication();
  const [teamPage, setTeamPage] = React.useState(1);

  const metrics = getDashboardMetrics(tasks);
  const recentTasks = getRecentTasks(tasks, 5);
  const recentActivities = getRecentActivities(activities, 10);

  const TEAM_PER_PAGE = 4;
  const totalTeamPages = Math.max(1, Math.ceil((employees?.length || 0) / TEAM_PER_PAGE));
  const paginatedEmployees = (employees || []).slice((teamPage - 1) * TEAM_PER_PAGE, teamPage * TEAM_PER_PAGE);

  return (
    <ProtectedRoute>
      <div className="w-full space-y-8 pb-12 transition-colors duration-300 relative">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-4 sm:p-6 md:p-7 text-white shadow-xl dark:border-zinc-800/40 dark:from-zinc-900/90 dark:via-zinc-950/80 dark:to-indigo-950/40 backdrop-blur-sm group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-all duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-all duration-700"></div>

          <div className="flex flex-col gap-2 relative z-10 py-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-outfit text-white">
              {(user as any)?.isNewUser ? `Welcome, ${user?.name || 'User'}` : `Welcome Back, ${user?.name || 'User'}`}
            </h2>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TaskSummaryCard title="Total Tasks" value={metrics.totalTasks} href="/tasks" color="blue" icon={<ListTodo className="h-5 w-5" />} />
          <TaskSummaryCard title="Pending Tasks" value={metrics.pendingTasks} href="/tasks?status=pending" color="amber" icon={<CircleDashed className="h-5 w-5" />} />
          <TaskSummaryCard title="In Progress" value={metrics.inProgressTasks} href="/tasks?status=in-progress" color="indigo" icon={<Clock3 className="h-5 w-5" />} />
          <TaskSummaryCard title="Completed" value={metrics.completedTasks} href="/tasks?status=completed" color="green" icon={<CheckCircle2 className="h-5 w-5" />} />

        </section>

        <section className="enterprise-card rounded-2xl p-6 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Analytics Overview</h3>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PieChartCard tasks={tasks} />
            <KPICard tasks={tasks} />
            <BarChartCard tasks={tasks} employees={employees} />
          </div>
        </section>

        {/* ── MIDDLE GRID: Recent Tasks & Communication Quick Access ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <section className="enterprise-card rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Recent Tasks</h3>
              </div>
              <Link href="/tasks" className="text-xs font-bold text-teal-700 transition hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300">View All Tasks &rarr;</Link>
            </div>
            <div className="mt-4">
              {recentTasks.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-zinc-50/20 dark:border-zinc-850 dark:bg-zinc-900/5 backdrop-blur-sm shadow-sm">
                  <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="grid gap-3 p-4 transition-all duration-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">{task.title}</h4>
                          <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-500">{task.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-500">
                          <TimerReset className="h-3.5 w-3.5" />
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="No tasks found" message="Create tasks to see them tracked in real time." />
              )}
            </div>
          </section>

          {/* Communication Quick Access */}
          <section className="enterprise-card rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Communication</h3>
              </div>
              <Link href="/communication" className="text-xs font-bold text-teal-700 transition hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300">Open Hub &rarr;</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/communication" className="flex items-center gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-3 transition-all duration-300 hover:shadow-sm hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-900/25">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                  <Inbox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Inbox</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{unreadMessageCount} unread</p>
                </div>
              </Link>
              <Link href="/communication" className="flex items-center gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-3 transition-all duration-300 hover:shadow-sm hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-900/25">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
                  <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Announcements</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">{announcements.length} active</p>
                </div>
              </Link>
            </div>
            {conversations.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                {conversations.slice(0, 3).map((conv) => (
                  <Link key={conv.id} href="/communication" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${conv.unreadCount > 0 ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{conv.subject}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 ml-auto shrink-0">{conv.participantNames[0]}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── ALIGNED DYNAMIC HEIGHT SECTION: Recent Activity (Left) & Team Members (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* Left: Recent Activity Card */}
          <section className="enterprise-card rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Recent Activity</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">Latest team actions across tasks.</p>
                </div>
                <span className="rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-400">
                  Latest 10
                </span>
              </div>
              {recentActivities.length > 0 ? (
                <div className="mt-5 max-h-[340px] overflow-y-auto pr-2 relative">
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="relative pl-8 text-xs transition-colors duration-300">
                        <div className="absolute left-3 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-950"></div>
                        <div>
                          <span className="font-extrabold text-zinc-950 dark:text-zinc-50">{activity.employeeName}</span>{' '}
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                            {activity.details ?? `${activityMessages[activity.action]} ${activity.taskTitle}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="No activity yet" message="Task updates will appear here as your team works." />
              )}
            </div>
          </section>

          {/* Right: Team Members Card (Paginating matching items & bottom View All button) */}
          <section className="enterprise-card rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-zinc-500 dark:text-zinc-500" />
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Team Members</h3>
                </div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  Page {teamPage} of {totalTeamPages}
                </span>
              </div>

              <div className="mt-5 space-y-3 min-h-[290px]">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/20 p-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/10">
                      <div className="flex items-center gap-3">
                        {employee.avatarUrl || (employee as any).profilePicture ? (
                          <img
                            src={employee.avatarUrl || (employee as any).profilePicture}
                            alt={employee.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-teal-600/30 dark:ring-teal-400/30 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                              const fallbackEl = (e.target as HTMLElement).nextElementSibling;
                              if (fallbackEl) (fallbackEl as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-9 h-9 rounded-full bg-teal-700 dark:bg-teal-600 text-white font-bold items-center justify-center text-xs shrink-0 ring-2 ring-zinc-200 dark:ring-zinc-800 ${
                            employee.avatarUrl || (employee as any).profilePicture ? 'hidden' : 'flex'
                          }`}
                        >
                          {employee.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{employee.name}</h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold">{employee.designation || 'Specialist'}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 px-2 py-0.5 text-[9px] font-bold">Active</span>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No members found" message="Add members to get started." />
                )}
              </div>
            </div>

            {/* Footer with Pagination Controls & Prominent View All Members Tab */}
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={teamPage === 1}
                  onClick={() => setTeamPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
                >
                  &larr; Prev
                </button>
                <button
                  type="button"
                  disabled={teamPage >= totalTeamPages}
                  onClick={() => setTeamPage(prev => Math.min(totalTeamPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>

              <Link
                href="/employees"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-600 dark:border-teal-400 text-xs font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition shadow-xs cursor-pointer"
              >
                View All Members &rarr;
              </Link>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

