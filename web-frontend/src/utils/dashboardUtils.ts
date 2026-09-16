import { ActivityLog, Employee, Task, TaskStatus } from '../types';
import { formatDate } from './format';

export type TaskUrlStatus = 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue';

const todayStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

export const isOverdueTask = (task: Task) => {
  if (task.status === 'overdue') return true;
  const due = new Date(`${task.dueDate}T00:00:00`).getTime();
  return due < todayStart() && task.status !== 'completed';
};

export const getDashboardMetrics = (tasks: Task[]) => {
  const overdueTasks = tasks.filter(isOverdueTask);
  const overdueIds = new Set(overdueTasks.map((t) => t.id));

  return {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((task) => task.status === 'todo' && !overdueIds.has(task.id)).length,
    inProgressTasks: tasks.filter((task) => task.status === 'in_progress' && !overdueIds.has(task.id)).length,
    completedTasks: tasks.filter((task) => task.status === 'completed').length,

    overdueTasks: overdueTasks.length,
  };
};

export const getRecentTasks = (tasks: Task[], limit = 5) =>
  [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

export const getStatusChartData = (tasks: Task[]) => {
  const { pendingTasks, inProgressTasks, completedTasks, overdueTasks } = getDashboardMetrics(tasks);

  return [
    { name: 'Pending', value: pendingTasks, key: 'todo' },
    { name: 'In Progress', value: inProgressTasks, key: 'in_progress' },
    { name: 'Completed', value: completedTasks, key: 'completed' },

    { name: 'Overdue', value: overdueTasks, key: 'overdue' },
  ].filter((item) => item.value > 0);
};

export const getCompletedTimelineData = (tasks: Task[]) => {
  const dateMap = tasks
    .filter((task) => task.status === 'completed')
    .reduce<Record<string, number>>((acc, task) => {
      acc[task.dueDate] = (acc[task.dueDate] || 0) + 1;
      return acc;
    }, {});

  return Object.keys(dateMap)
    .sort()
    .map((date) => ({
      date: formatDate(date),
      tasks: dateMap[date],
    }));
};

export const getTeamWorkloadData = (tasks: Task[], employees: Employee[]) =>
  employees.map((employee) => {
    const employeeTasks = tasks.filter((task) => task.assignedTo === employee.id);

    return {
      name: employee.name.split(' ')[0],
      todo: employeeTasks.filter((task) => task.status === 'todo' && !isOverdueTask(task)).length,
      inProgress: employeeTasks.filter((task) => task.status === 'in_progress' && !isOverdueTask(task)).length,
      completed: employeeTasks.filter((task) => task.status === 'completed').length,
      overdue: employeeTasks.filter(isOverdueTask).length,
    };
  });

export const getFilteredTasksByUrlStatus = (tasks: Task[], status: TaskUrlStatus) => {
  if (status === 'pending') return tasks.filter((task) => task.status === 'todo');
  if (status === 'in-progress') return tasks.filter((task) => task.status === 'in_progress');
  if (status === 'completed') return tasks.filter((task) => task.status === 'completed');

  if (status === 'overdue') return tasks.filter(isOverdueTask);
  return tasks;
};

export const toTaskStatus = (status: TaskUrlStatus): TaskStatus | 'all' =>
  status === 'pending'
    ? 'todo'
    : status === 'in-progress'
      ? 'in_progress'
      : status === 'completed'
        ? 'completed'
        : status === 'overdue'
          ? 'overdue'
          : 'all';

export const getRecentActivities = (activities: ActivityLog[], limit = 10) =>
  [...activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
