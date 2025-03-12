'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string | null;
  project?: { name?: string };
}

export default function MemberDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      setLoading(true);
  
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) {
        setError('Failed to get user information');
        setLoading(false);
        return;
      }
  
      const userId = user.user.id;
  
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, status, due_date, project:project_id(name)')
        .eq('assigned_to', userId)
        .not('assigned_to', 'is', null);
  
      if (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to fetch tasks');
        setLoading(false);
        return;
      }
  
      // Ensure that data is always an array
      setTasks(data as Task[] ?? []);
      setLoading(false);
    };
  
    fetchAssignedTasks();
  }, []);
  
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Member Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Link key={task.id} href={`/dashboard/member/${task.id}`} passHref>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition duration-300">
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
