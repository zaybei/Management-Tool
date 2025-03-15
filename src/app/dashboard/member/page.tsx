'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string | null;
  project_id?: string;
  project?: { name?: string };
}

export default function MemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoadingLogout(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout');
    } else {
      router.push('/signin');
    }
    setLoadingLogout(false);
  };

  const fetchAssignedTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Failed to get user information');
      setLoading(false);
      return;
    }

    const userId = user.id;

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description, status, due_date, project:project_id(name)')
      .eq('assigned_to', userId)

    if (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
      setLoading(false);
      return;
    }

    setTasks(data as Task[] || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAssignedTasks();
  }, [fetchAssignedTasks]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Member Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          {loadingLogout ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchAssignedTasks}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Retry</title>
              <path
                d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-9a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Link key={task.id} href={`/dashboard/member/${task.id}`} passHref>
                <div
                  className="bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition duration-300"
                >
                  <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
                  <p className="text-gray-400">{task.description}</p>
                  <p className="text-sm text-gray-500">Status: {task.status}</p>
                  <p className="text-sm text-gray-500">
                    Project: {task.project?.name ?? 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due Date: {task.due_date ?? 'No due date'}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400">No assigned tasks</p>
          )}
        </div>
      )}
    </div>
  );
}

