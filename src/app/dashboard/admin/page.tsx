'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        router.push('/signin');
        return;
      }

      const userId = authData.user.id;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('full_name') 
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('User Fetch Error:', userError);
        setError('Failed to fetch user data.');
      } else {
        setUser({
          ...authData.user,
          full_name: userData?.full_name || authData.user.email,
        });
      }

      const { count, error: projectError } = await supabase
        .from('projects')
        .select('*', { count: 'exact' });

      if (projectError) {
        console.error('Project Fetch Error:', projectError);
        setError('Failed to fetch projects.');
      } else {
        setProjectCount(count);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await supabase.auth.signOut();
    router.push('/signin');
    setLogoutLoading(false);
  };

  if (loading) {
    return <div className="text-white text-center text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center text-lg font-semibold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold">Welcome {user?.full_name || user?.email || 'User'}</h1>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className={`bg-red-500 text-white px-5 py-2 rounded-lg transition-all duration-300 ${
              logoutLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
            }`}
          >
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {/* Projects Card with Hover Effect */}
        <Link href="/dashboard/projects">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center mb-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <h2 className="text-xl font-bold text-gray-300">Projects</h2>
            <p className="text-4xl font-extrabold text-blue-400 mt-2">{projectCount !== null ? projectCount : '...'}</p>
          </div>
        </Link>

        {/* Create Project Button */}
        <Link href="/dashboard/create-project">
          <button className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-300">
            + Create New Project
          </button>
        </Link>
      </div>
    </div>
  );
}