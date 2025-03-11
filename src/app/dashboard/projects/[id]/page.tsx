'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabaseClient';

interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
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
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = useCallback(async (id: string) => {
    setLoading(true);
    const { data: taskData } = await supabase.from('tasks').select('*').eq('project_id', id).order('position', { ascending: true });
    setTasks(taskData || []);
    fetchComments(taskData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      await fetchProjectDetails(projectId);
      await fetchUsers();
    };
    fetchData();
  }, [projectId, fetchProjectDetails]);

  const fetchUsers = async () => {
    const { data: userData } = await supabase.from('users').select('id, full_name');
    setUsers(userData || []);
  };

  const fetchComments = async (tasks: Task[]) => {
    const taskIds = tasks.map(task => task.id);
    const { data: commentData } = await supabase.from('comments').select('*').in('task_id', taskIds);
    const groupedComments = commentData?.reduce((acc, comment) => {
      acc[comment.task_id] = acc[comment.task_id] || [];
      acc[comment.task_id].push(comment);
      return acc;
    }, {} as { [key: string]: Comment[] }) || {};
    setComments(groupedComments);
  };

  const handleAddTask = async () => {
    if (!taskTitle) return;
    await supabase.from('tasks').insert([{ title: taskTitle, description: taskDescription, project_id: projectId, assigned_to: taskAssignee }]);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee('');
    fetchProjectDetails(projectId);
  };

  const handleAddComment = async (taskId: string) => {
    if (!newComment[taskId]) return;
    await supabase.from('comments').insert([{ task_id: taskId, content: newComment[taskId] }]);
    setNewComment({ ...newComment, [taskId]: '' });
    fetchProjectDetails(projectId);
  };

  if (loading) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center gap-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
        <input type="text" placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full p-2 mb-2 rounded bg-gray-700 text-white" />
        <textarea placeholder="Task description (optional)" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="w-full p-2 mb-2 rounded bg-gray-700 text-white" />
        <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="w-full p-2 mb-2 rounded bg-gray-700 text-white">
          <option value="">Assign to...</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.full_name}</option>
          ))}
        </select>
        <button onClick={handleAddTask} className="w-full bg-blue-500 px-4 py-2 rounded-lg mt-2">Add Task</button>
      </div>
      <div className="w-full max-w-2xl">
        {tasks.map((task) => (
          <div key={task.id} className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
            <h3 className="text-xl font-semibold">{task.title}</h3>
            <p className="text-gray-300 mt-2">{task.description}</p>
            <h4 className="text-lg font-semibold mt-4">Comments</h4>
            <div className="max-h-32 overflow-y-auto bg-gray-700 p-2 rounded mt-2">
              {comments[task.id]?.map((comment) => (
                <p key={comment.id} className="text-gray-200 p-2 rounded">{comment.content}</p>
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
