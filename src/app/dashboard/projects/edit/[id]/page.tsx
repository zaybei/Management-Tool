'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../../utils/supabaseClient';
import { useRouter, useParams } from 'next/navigation';

export default function EditProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDueDate, setProjectDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('name, description, due_date')
        .eq('id', projectId)
        .single();

      if (error) {
        setError('Failed to fetch project.');
        console.error('Error fetching project:', error);
      } else {
        setProjectName(data.name);
        setProjectDescription(data.description || '');
        setProjectDueDate(data.due_date || '');
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId]);

  const handleUpdateProject = async () => {
    if (!projectName.trim()) return alert('Project name is required');

    const { error } = await supabase
      .from('projects')
      .update({ name: projectName, description: projectDescription, due_date: projectDueDate })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project.');
    } else {
      router.push(`/dashboard/projects/${projectId}`);
    }
  };

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6">Edit Project</h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg"
          />
          <textarea
            placeholder="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg"
          />
          <input
            type="date"
            placeholder="Project Due Date"
            value={projectDueDate}
            onChange={(e) => setProjectDueDate(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => router.push(`/dashboard/projects/${projectId}`)} className="bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
            <button onClick={handleUpdateProject} className="bg-blue-500 px-4 py-2 rounded-lg">Update</button>
          </div>
        </div>
      </div>
    </div>
  );
}