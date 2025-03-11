'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../utils/supabaseClient';

export default function TaskDetails() {
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;
  const router = useRouter();

  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTaskDetails = async () => {
      setLoading(true);

      const { data: taskData } = await supabase
        .from('tasks')
        .select('id, title, description, status, due_date, project:project_id(name)')
        .eq('id', id)
        .single();

      if (taskData) {
        setTask(taskData);
        setStatus(taskData.status);
      }

      const { data: commentsData } = await supabase
        .from('comments')
        .select('id, content, created_at, user:user_id(full_name)')
        .eq('task_id', id)
        .order('created_at', { ascending: true });

      if (commentsData) setComments(commentsData);

      setLoading(false);
    };

    fetchTaskDetails();
  }, [id]);

  const handleStatusChange = async () => {
    const confirmChange = window.confirm('Are you sure you want to change the status?');
    if (!confirmChange) return;

    await supabase.from('tasks').update({ status }).eq('id', id);
    alert('Status updated successfully!');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userData?.user || userError) {
      console.error('Error fetching user:', userError);
      return;
    }
  
    // Fetch full_name from the "users" table instead of "profiles"
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', userData.user.id)
      .single();
  
    if (profileError || !userProfile) {
      console.warn('User profile not found, using default name.');
    }
  
    const fullName = userProfile?.full_name ?? 'Unknown User';
  
    // Insert comment
    const { error: commentError } = await supabase.from('comments').insert([
      { task_id: id, user_id: userData.user.id, content: newComment }
    ]);
  
    if (commentError) {
      console.error('Error adding comment:', commentError);
      return;
    }
  
    // Immediately update UI with new comment
    setComments([
      ...comments,
      {
        content: newComment,
        user: { full_name: fullName },
        created_at: new Date().toISOString(),
      }
    ]);
  
    setNewComment('');
  };
  
  if (loading) return <p className="text-center text-gray-400">Loading task details...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <button onClick={() => router.back()} className="text-blue-400 mb-4 hover:underline">
          ← Back
        </button>

        {/* Task Details */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2">{task?.title}</h1>
          <p className="text-gray-400">{task?.description}</p>

          <div className="mt-4 text-sm text-gray-400 space-y-1">
            <p><span className="font-semibold">Status:</span> {task?.status}</p>
            <p><span className="font-semibold">Project:</span> {task?.project?.name ?? 'Unknown'}</p>
            <p><span className="font-semibold">Due Date:</span> {task?.due_date ?? 'No due date'}</p>
          </div>
        </div>

        {/* Status Update */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
          <label className="text-lg font-semibold mb-2">Change Status:</label>
          <div className="flex gap-3">
            <select
              className="text-black p-2 rounded flex-grow bg-gray-100"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={handleStatusChange}
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Update
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>

          <div className="max-h-52 overflow-y-auto border border-gray-700 p-3 rounded-lg bg-gray-900 space-y-2">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="p-3 bg-gray-800 rounded-md">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold">{comment.user?.full_name}</span> - {new Date(comment.created_at).toLocaleString()}
                  </p>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet.</p>
            )}
          </div>

          {/* Add Comment */}
          <div className="mt-4 flex flex-col">
            <textarea
              className="w-full text-black p-2 rounded bg-gray-100"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
