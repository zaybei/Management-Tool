'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash, FiEdit } from 'react-icons/fi';

// Define Project interface with correct types
interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  owner_id: string;
  users?: { full_name?: string } | null; // Ensure it's optional or null
  creator_name: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
  
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at, owner_id, users:owner_id(full_name)')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching projects:', error.message);
        setError('Failed to fetch projects.');
      } else {
        // Ensure safe access to users.full_name
        const formattedData = data.map((project) => ({
          ...project,
          creator_name: (project as { users?: { full_name?: string } }).users?.full_name ?? 'Unknown',
        }));
        
        setProjects(formattedData);
      }
  
      setLoading(false);
    };
  
    fetchProjects();
  }, []);
  

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Error deleting project:', error);
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return alert('Project title is required');
  
    // Get authenticated user info
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.user) {
      console.error('Error fetching user:', userError?.message);
      return alert('Failed to get user information');
    }
  
    const owner_id = user.user.id; // Authenticated user's ID
  
    // Insert new project (without full_name)
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name: newProjectName, description: newProjectDescription, owner_id }])
      .select('id, name, description, created_at, owner_id');
  
    if (error) {
      console.error('Error creating project:', error);
      return;
    }
  
    if (data && data.length > 0) {
      const newProject = data[0];
  
      // Fetch full_name from users table after inserting
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', owner_id)
        .single();
  
      if (userFetchError) {
        console.error('Error fetching user name:', userFetchError.message);
      }
  
      setProjects((prev) => [
        {
          ...newProject,
          creator_name: userData?.full_name ?? 'Unknown', // Assign correct name
        },
        ...prev,
      ]);
    }
  
    setShowCreateModal(false);
    setNewProjectName('');
    setNewProjectDescription('');
  };
  
  

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold">Projects</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="mr-2" /> Create Project
          </button>
        </div>

        {/* Modal for Creating Projects */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <input
                type="text"
                placeholder="Project Title"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg"
              />
              <textarea
                placeholder="Project Description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleCreateProject} className="bg-blue-500 px-4 py-2 rounded-lg">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 text-white rounded-lg"
        />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:scale-105 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            >
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-blue-400">{project.name}</h2>
                <div className="flex gap-3">
                  <FiEdit
                    className="text-yellow-400 hover:text-yellow-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/projects/edit/${project.id}`);
                    }}
                  />
                  <FiTrash
                    className="text-red-400 hover:text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                  />
                </div>
              </div>
              <p className="text-gray-300 mt-2">{project.description || 'No description available'}</p>
              <p className="text-gray-500 text-sm mt-2">
                Created by {project.creator_name}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Created on {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
