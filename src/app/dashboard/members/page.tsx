'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { FiEdit } from 'react-icons/fi';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedFullName, setEditedFullName] = useState('');

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

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || !newFullName) {
      return alert('Please fill in all fields.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: {
          full_name: newFullName,
          role: newRole,
        },
      },
    });

    if (error) {
      console.error('Error creating user:', error);
      alert(error.message);
    } else {
      console.log('User created successfully!', data);

      // Insert user data into the users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: newEmail,
              full_name: newFullName,
              role: newRole,
            },
          ]);

        if (insertError) {
          console.error('Error inserting user data:', insertError);
          alert(insertError.message);
        }
      } else {
        console.error('Error: data.user is null');
        alert('Failed to create user. Please try again.');
      }

      // Fetch users again to update the list
      const { data: userData, error: userError } = await supabase.from('users').select('id, full_name, email, role');
      if (userError) console.error('Error fetching users:', userError);
      else setUsers(userData || []);
      setShowCreateModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('member');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditedFullName(user.full_name || '');
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from('users')
      .update({ full_name: editedFullName })
      .eq('id', editingUser.id);

    if (error) {
      console.error('Error updating user:', error);
      alert(error.message);
    } else {
      // Update the user in the local state
      setUsers(users.map((user) => (user.id === editingUser.id ? { ...user, full_name: editedFullName } : user)));
      setShowEditModal(false);
      setEditingUser(null);
      setEditedFullName('');
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
            className={
              "px-6 py-2 text-lg font-semibold rounded-lg transition-all duration-300 " +
              (activeTab === role ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600')
            }
          >
            {role === 'admin' ? 'Admins' : 'Members'}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mb-4">
        Create New User
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg" />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg" />
            <input
              type="text"
              placeholder="Full Name"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg" />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleCreateUser} className="bg-blue-500 px-4 py-2 rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={editedFullName}
              onChange={(e) => setEditedFullName(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleUpdateUser} className="bg-blue-500 px-4 py-2 rounded-lg">Update</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-lg">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col items-center">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xl font-semibold">{user.full_name || 'No Name'}</h3>
                <button
                  onClick={() => handleEditUser(user)}
                  className="text-gray-400 hover:text-gray-300 focus:outline-none"
                >
                  <FiEdit className="align-middle" />
                </button>
              </div>
              <p className="text-gray-400">{user.email}</p>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all">
                Delete User
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
