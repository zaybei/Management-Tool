'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

interface User {
  id: string;
  full_name?: string;
  email: string;
  role: 'admin' | 'member';
}

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admin' | 'member'>('member');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('id, full_name, email, role');
      if (error) console.error('Error fetching users:', error);
      else setUsers(data || []);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user:', error);
    } else {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const filteredUsers = users.filter((user) => user.role === activeTab);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-6">Members Management</h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {['member', 'admin'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveTab(role as 'admin' | 'member')}
            className={`px-6 py-2 text-lg font-semibold rounded-lg transition-all duration-300 ${
              activeTab === role ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {role === 'admin' ? 'Admins' : 'Members'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-lg">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col items-center">
              <h3 className="text-xl font-semibold">{user.full_name || 'No Name'}</h3>
              <p className="text-gray-400">{user.email}</p>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
