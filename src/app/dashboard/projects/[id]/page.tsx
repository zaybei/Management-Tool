'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabaseClient';

interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status?: string;
  position?: number;
}

interface User {
  id: string;
  full_name: string;
}

interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      await fetchProjectDetails(projectId);
      await fetchUsers();
    })();
  }, [projectId]);

  const fetchProjectDetails = async (id: string) => {
    setLoading(true);
    const { data: projectData } = await supabase.from('projects').select('*').eq('id', id).single();
    const { data: taskData } = await supabase.from('tasks').select('*').eq('project_id', id).order('position', { ascending: true });
    setProject(projectData);
    setTasks(taskData || []);
    fetchComments(taskData || []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: userData } = await supabase.from('users').select('id, full_name');
    setUsers(userData || []);
  };

  const fetchComments = async (tasks: Task[]) => {
    const taskIds = tasks.map(task => task.id);
    const { data: commentData, error } = await supabase
      .from('comments')
      .select('*, users: user_id (full_name)')
      .in('task_id', taskIds);
  
    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }
  
    const groupedComments = commentData?.reduce((acc, comment) => {
      acc[comment.task_id] = acc[comment.task_id] || [];
      acc[comment.task_id].push({
        ...comment,
        user_full_name: comment.users?.full_name || 'Unknown',
      });
      return acc;
    }, {} as { [key: string]: Comment[] }) || {};
  
    setComments(groupedComments);
  };

  const handleAddTask = async () => {
    if (!taskTitle) return;
    await supabase.from('tasks').insert([{ title: taskTitle, description: taskDescription, assigned_to: taskAssignee, project_id: projectId }]);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee('');
    fetchProjectDetails(projectId);
  };

  const handleAddComment = async (taskId: string) => {
    if (!newComment[taskId]) return;
  
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
      console.error('Error fetching user:', userError);
      return;
    }
  
    await supabase.from('comments').insert([
      {
        task_id: taskId,
        content: newComment[taskId],
        user_id: user.user.id,
      },
    ]);
  
    setNewComment({ ...newComment, [taskId]: '' });
    fetchProjectDetails(projectId);
  };

  // New function to update assigned user
  const handleUpdateAssignee = async (taskId: string, newAssignee: string) => {
    if (!newAssignee) return;
    await supabase.from('tasks').update({ assigned_to: newAssignee }).eq('id', taskId);
    fetchProjectDetails(projectId);
  };

  if (loading) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Create Task</h2>
          <input type="text" placeholder="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white mt-2" />
          <input type="text" placeholder="Task Description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white mt-2" />
          <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white mt-2">
            <option value="">Select Assignee</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
          <button onClick={handleAddTask} className="w-full bg-blue-500 px-4 py-2 rounded-lg mt-2">Add Task</button>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
            <h3 className="text-xl font-semibold">{task.title}</h3>
            <p className="text-gray-300 mt-2">{task.description}</p>
            <p className="text-sm text-gray-400 mt-2">Status: <span className="font-semibold">{task.status}</span></p>
            <p className="text-sm text-gray-400 mt-2">Assigned to: {users.find(user => user.id === task.assigned_to)?.full_name || 'Unassigned'}</p>

            {/* Dropdown to update assignee */}
            <select
              value={task.assigned_to || ''}
              onChange={(e) => handleUpdateAssignee(task.id, e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white mt-2"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>

            <h4 className="text-lg font-semibold mt-4">Comments</h4>
            <div className="max-h-32 overflow-y-auto bg-gray-700 p-2 rounded mt-2">
              {comments[task.id]?.map((comment) => (
                <p key={comment.id} className="text-gray-200 p-2 rounded">
                  <strong>{comment.user_full_name}:</strong> {comment.content}
                </p>
              ))}
            </div>
            <input type="text" placeholder="Add a comment" value={newComment[task.id] || ''} onChange={(e) => setNewComment({ ...newComment, [task.id]: e.target.value })} className="w-full p-2 rounded bg-gray-700 text-white mt-2" />
            <button onClick={() => handleAddComment(task.id)} className="w-full bg-green-500 px-4 py-2 rounded-lg mt-2">Post</button>
          </div>
        ))}
      </div>
    </div>
  );
}
