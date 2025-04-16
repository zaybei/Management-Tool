'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { FiEdit } from 'react-icons/fi';
import useFocusTrap from '../../hooks/useFocusTrap';
import Card from '../../components/Card';
import useDebounce from '../../hooks/useDebounce';

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
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedFullName, setEditedFullName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const createModalRef = useFocusTrap(showCreateModal);
  const editModalRef = useFocusTrap(showEditModal);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('users').select('id, full_name, email, role');
      if (error) {
        console.error('Error fetching users:', error);
        setErrorMessage('Failed to fetch users.');
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('Failed to delete user.');
    } else {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setSuccessMessage('User deleted successfully.');
    }
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || !newFullName) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    setCreatingUser(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
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
        setErrorMessage(error.message);
      } else {
        console.log('User created successfully!', data);
        setSuccessMessage('User created successfully!');
        if (data.user) {
          setUsers((prevUsers) => {
            if (!data.user) return prevUsers;
            return [
              ...prevUsers,
              {
                id: data.user.id,
                email: newEmail,
                full_name: newFullName,
                role: newRole,
              },
            ];
          });

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
            setErrorMessage(insertError.message);
          }
        } else {
          console.error('Error: data.user is null');
          setErrorMessage('Failed to create user. Please try again.');
        }
        setShowCreateModal(false);
        setNewEmail('');
        setNewPassword('');
        setNewFullName('');
        setNewRole('member');
      }
    } catch (err) {
      console.error('Unexpected error during user creation:', err);
      setErrorMessage((err as Error).message || 'Unexpected error occurred. Please try again.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditedFullName(user.full_name || '');
    setShowEditModal(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setUpdatingUser(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: editedFullName })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Error updating user:', error);
        setErrorMessage(error.message);
      } else {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser.id ? { ...user, full_name: editedFullName } : user
          )
        );
        setShowEditModal(false);
        setEditingUser(null);
        setEditedFullName('');
        setSuccessMessage('User updated successfully!');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setErrorMessage((err as Error).message || 'Failed to update user.');
    } finally {
      setUpdatingUser(false);
    }
  };

  const filteredUsers = users
    .filter((user) => user.role === activeTab)
    .filter((user) =>
      user.full_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

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
              (activeTab === role
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 hover:bg-gray-600')
            }
          >
            {role === 'admin' ? 'Admins' : 'Members'}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
        className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
        disabled={creatingUser}
      >
        {creatingUser ? 'Creating...' : 'Create New User'}
      </button>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
          {errorMessage}
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()} ref={createModalRef}>
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
              <button onClick={handleCreateUser} className="bg-blue-500 px-4 py-2 rounded-lg" disabled={creatingUser}>
                {creatingUser ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setShowEditModal(false)}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()} ref={editModalRef}>
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={editedFullName}
              onChange={(e) => setEditedFullName(e.target.value)}
              className="w-full p-2 mb-3 bg-gray-700 text-white rounded-lg" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleUpdateUser} className="bg-blue-500 px-4 py-2 rounded-lg" disabled={updatingUser}>
                {updatingUser ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center">
          <p className="text-lg">No users found.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
          >
            Add New User
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
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
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                Delete User
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
