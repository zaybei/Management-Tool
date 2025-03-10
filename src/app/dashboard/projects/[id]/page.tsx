'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../utils/supabaseClient';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      await fetchProjectDetails(params.id);
      await fetchUsers();
    };
    fetchData();
  }, [params.id]);

  const fetchProjectDetails = async (projectId: string) => {
    setLoading(true);
    const { data: projectData } = await supabase.from('projects').select('*').eq('id', projectId).single();
    const { data: taskData } = await supabase.from('tasks').select('*').eq('project_id', projectId);
    setProject(projectData);
    setTasks(taskData || []);
    const commentsData: { [key: string]: any[] } = {};
    for (let task of taskData || []) {
      const { data: commentData } = await supabase.from('comments').select('*').eq('task_id', task.id);
      commentsData[task.id] = commentData || [];
    }
    setComments(commentsData);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data: userData } = await supabase.from('users').select('id, full_name');
    setUsers(userData || []);
  };

  const handleAddTask = async () => {
    if (!taskTitle) return;
    await supabase.from('tasks').insert([{ title: taskTitle, description: taskDescription, project_id: project.id, assigned_to: taskAssignee }]);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee('');
    fetchProjectDetails(project.id);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    fetchProjectDetails(project.id);
  };

  const handleAddComment = async (taskId: string) => {
    if (!newComment[taskId]) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    await supabase.from('comments').insert([{ task_id: taskId, user_id: userData.user.id, content: newComment[taskId] }]);
    setNewComment({ ...newComment, [taskId]: '' });
    fetchProjectDetails(project.id);
  };

  if (loading) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{project?.name}</h1>
        <p className="mb-6 text-gray-300 text-lg">{project?.description}</p>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
          <input type="text" placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 transition" />
          <textarea placeholder="Task description" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 transition" />
          <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 transition">
            <option value="">Assign to...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
          <button onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-600 transition px-5 py-2 rounded-lg shadow-md hover:shadow-lg">Add Task</button>
        </div>
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-gray-800 p-5 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-1">
              <h3 className="text-xl font-semibold">{task.title}</h3>
              <p className="text-gray-300 text-sm">{task.description}</p>
              <select value={task.status} onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)} className="w-full p-2 mt-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 transition">
                <option value="todo">📝 To Do</option>
                <option value="in_progress">🚀 In Progress</option>
                <option value="done">✅ Done</option>
                <option value="blocked">❌ Blocked</option>
              </select>
              <div className="mt-4">
                <h4 className="text-lg font-semibold">Comments</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {comments[task.id]?.map((comment, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-white font-bold">
                        {comment.user_id.charAt(0).toUpperCase()}
                      </div>
                      <p className="bg-gray-700 px-3 py-2 rounded-lg text-gray-200">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
