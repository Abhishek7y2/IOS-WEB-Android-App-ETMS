import { TasksClient } from './TasksClient';
import { TaskUrlStatus } from '../../utils/dashboardUtils';

const validStatuses: TaskUrlStatus[] = ['all', 'pending', 'in-progress', 'completed'];

type TasksPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

import ProtectedRoute from '../../components/ProtectedRoute';

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const initialStatus = validStatuses.includes(statusParam as TaskUrlStatus) ? statusParam as TaskUrlStatus : 'all';

  return (
    <ProtectedRoute>
      <TasksClient initialStatus={initialStatus} />
    </ProtectedRoute>
  );
}

