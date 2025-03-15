'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabaseClient';

interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status?: string;
  position?: number;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  due_date?: string;
}

const TaskCard = ({ task, users, getStatusBgColor, getPriorityColor, handleUpdateStatus }: {
  task: Task;
  users: User[];
  getStatusBgColor: (status?: string) => string;
  getPriorityColor: (priority?: string) => string;
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
 // handleDeleteTask: (taskId: string) => Promise<void>;
}) => (
  <div
    key={task.id}
    className={`bg-gray-800 rounded-lg shadow-lg p-6 mb-4 cursor-pointer hover:bg-gray-600
                  hover:bg-opacity-30
                  ${getStatusBgColor(task.status)}
                  ${task.status === 'done' ? 'hover:bg-green-300' : ''}
                  ${task.status === 'in_progress' ? 'hover:bg-yellow-300' : ''}
                  ${task.status === 'todo' ? 'hover:bg-blue-300' : ''}
                 `}
    >
    <h4 className="text-lg font-semibold">{task.title}</h4>
    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{task.description}</p>
    <p className="text-sm text-gray-400 mt-2">Category: {task.category || 'N/A'}</p>

    <div className="flex justify-between items-center mt-4">
      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
      </span>
      {task.due_date && (
        <span className="text-sm text-gray-400">Due: {new Date(task.due_date).toLocaleDateString()}</span>
      )}
    </div>

    <div className="flex items-center justify-between mt-4">
      <div className="flex space-x-2">
        {task.assigned_to && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
              {users.find(user => user.id === task.assigned_to)?.full_name?.charAt(0) || '?'}
            </div>
          </div>
        )}
      </div>

      <select
        value={task.status || 'todo'}
        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
        className="text-sm p-2 rounded bg-gray-700 text-white"
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  </div>
);
export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Design' | 'Development' | 'QA' | 'Completed'>('All');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');
  const [taskCategory, setTaskCategory] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  //  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchProjectDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase.from('projects').select('*').eq('id', id).single();
      if (projectError) {
        throw projectError;
      }
      const { data: taskData, error: taskError } = await supabase.from('tasks').select('*').eq('project_id', id).order('position', { ascending: true });
      if (taskError) {
        throw taskError;
      }
      setProject(projectData);
      setTasks(taskData || []);
      fetchComments(taskData || []);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    await fetchProjectDetails(projectId);
    await fetchUsers();
  }, [projectId, fetchProjectDetails]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchUsers = async () => {
    const { data: userData } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('role', ['admin', 'member']);
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
    await supabase.from('tasks').insert([{
      title: taskTitle,
      description: taskDescription,
      assigned_to: taskAssignee,
      project_id: projectId,
      due_date: taskDueDate,
      priority: taskPriority,
      category: taskCategory,
      status: 'todo'
    }]);
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssignee('');
    setTaskDueDate('');
    setTaskPriority('medium');
    fetchProjectDetails(projectId);
    setShowModal(false);
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

  const handleUpdateAssignee = async (taskId: string, newAssignee: string) => {
    if (!newAssignee) return;
    await supabase.from('tasks').update({ assigned_to: newAssignee }).eq('id', taskId);
    fetchProjectDetails(projectId);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      console.log('Attempting to update task', taskId, 'to status:', newStatus);

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating status:', error);
        return;
      }

      // Immediate UI update
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Fetch updated data
      await fetchProjectDetails(projectId);
    } catch (err) {
      console.error('Exception in handleUpdateStatus:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      console.error('Error deleting task:', error);
      return;
    }
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  } catch (err) {
    console.error('Exception in handleDeleteTask:', err);
  }
};

  // const handleSelectTask = (task: Task) => {
  //   setSelectedTask(task);
  // };

  // Calculate task stats
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const activeMembers = [...new Set(tasks.filter(task => task.assigned_to).map(task => task.assigned_to))].length;

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'Completed') return task.status === 'done';
        if (activeTab === 'All') return true;
        return task.category === activeTab;
    });


  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  };

  const getPriorityColor = (priority?: string) => priorityColors[priority as keyof typeof priorityColors] || 'text-gray-500';

  const statusColors = {
    done: 'border-l-4 border-green-500',
    in_progress: 'border-l-4 border-yellow-500',
    todo: 'border-l-4 border-blue-500',
  };

  const getStatusBgColor = (status?: string) => statusColors[status as keyof typeof statusColors] || '';

  if (loading) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center gap-6">
      {/* Hero Section */}
      <div className="w-full max-w-4xl px-4">
        <div className="bg-gradient-to-r from-blue-900 to-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold mb-4">{project?.name || 'Project Details'}</h1>
          <p className="text-gray-400 mt-2 mb-8">{project?.description || 'No description available'}</p>

          <div className="flex flex-wrap gap-4 justify-between">
            <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg shadow-md flex-1 min-w-[150px]">
              <h3 className="font-semibold text-sm">Tasks</h3>
              <p className="text-blue-400 text-lg">{completedTasks} / {tasks.length} Completed</p>
            </div>
            <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg shadow-md flex-1 min-w-[150px]">
              <h3 className="font-semibold text-sm">Members</h3>
              <p className="text-blue-400 text-lg">{activeMembers} Active</p>
            </div>
            <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg shadow-md flex-1 min-w-[150px]">
              <h3 className="font-semibold text-sm">Due Date</h3>
              <p className="text-blue-400 text-lg">{project?.due_date || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Task Button */}
      <div className="flex justify-end w-full max-w-4xl">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowModal(true)}
        >
          Add New Task
        </button>
      </div>

      {/* Task Creation Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-white">
                  Create New Task
                </h3>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Task Description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white mt-2"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="p-2 rounded bg-gray-700 text-white">
                      <option value="">Select Assignee</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.full_name}</option>
                      ))}
                    </select>

                    <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as Task['priority'])} className="p-2 rounded bg-gray-700 text-white">
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)} className="p-2 rounded bg-gray-700 text-white">
                      <option value="">Select Category</option>
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="QA">QA</option>
                    </select>

                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="p-2 rounded bg-gray-700 text-white"
                      placeholder="Due Date"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddTask}
                >
                  Create
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-400 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Cards Section */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Project Tasks</h2>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-700 pb-2 mb-4">
          {['All', 'Design', 'Development', 'QA', 'Completed'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab(tab as 'All' | 'Design' | 'Development' | 'QA' | 'Completed')}
            >
              {tab}
            </button>
          ))}
        </div>


        {/* Kanban Layout */}
        <div className="flex gap-4">
          {/* Todo Tasks */}
          <div className="w-1/3 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 pb-2">
              To Do ({filteredTasks.filter(task => task.status === 'todo' || !task.status).length})
            </h3>
            <div className="space-y-4">
              {filteredTasks.filter(task => task.status === 'todo' || !task.status).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  users={users}
                  getStatusBgColor={getStatusBgColor}
                  getPriorityColor={getPriorityColor}
                  handleUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>

          {/* In Progress Tasks */}
          <div className="w-1/3 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 pb-2">
              In Progress ({filteredTasks.filter(task => task.status === 'in_progress').length})
            </h3>
            <div className="space-y-4">
              {filteredTasks.filter(task => task.status === 'in_progress').map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  users={users}
                  getStatusBgColor={getStatusBgColor}
                  getPriorityColor={getPriorityColor}
                  handleUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>

          {/* Done Tasks */}
          <div className="w-1/3 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 pb-2">
              Done ({filteredTasks.filter(task => task.status === 'done').length})
            </h3>
            <div className="space-y-4">
              {filteredTasks.filter(task => task.status === 'done').map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  users={users}
                  getStatusBgColor={getStatusBgColor}
                  getPriorityColor={getPriorityColor}
                  handleUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Section */}
      <div className="w-full max-w-4xl mt-8">
  <h2 className="text-2xl font-bold mb-4">Task Details</h2>
  {tasks.map((task) => (
    <div key={task.id} className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
      {/* Task Info */}
      <h3 className="text-xl font-semibold">{task.title}</h3>
      <p className="text-gray-300 mt-2">{task.description}</p>

      {/* Status & Assignee */}
      <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
        <p>Status: <span className="font-semibold text-blue-400">{task.status}</span></p>
        <div className="flex items-center gap-2">
          <span>Assigned to:</span>
          <select
            value={task.assigned_to || ''}
            onChange={(e) => handleUpdateAssignee(task.id, e.target.value)}
            className="bg-gray-700 text-white px-2 py-1 rounded-lg"
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
        </div>
        </div>
          {/* Delete Task Button with Confirmation */}
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              await handleDeleteTask(task.id);
            }
          }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
        >
          Delete Task
        </button>

      {/* Comments Section */}
      <h4 className="text-lg font-semibold mt-4">Comments</h4>
      <div className="max-h-40 overflow-y-auto bg-gray-700 p-3 rounded mt-2 space-y-2">
        {comments[task.id]?.map((comment) => (
          <div key={comment.id} className="bg-gray-600 p-2 rounded-lg">
            <p className="text-gray-200">
              <strong className="text-blue-400">{comment.user_full_name}:</strong> {comment.content}
            </p>
            <p className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Add Comment Input */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment[task.id] || ''}
          onChange={(e) => setNewComment({ ...newComment, [task.id]: e.target.value })}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={() => handleAddComment(task.id)}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          Post
        </button>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}