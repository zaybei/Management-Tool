'use client';
import { useState, FormEvent } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function UpdateProfile() {
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

    e.preventDefault();
    setError(null);

    try {
    if (userError || !user) throw new Error('User not authenticated');

      if (!user) throw new Error('User not authenticated');

      // Update user metadata
      const { error: updateError } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Update Profile</h1>
      <form onSubmit={handleUpdate} className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="fullName">
            Full Name
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Update
        </button>
        {success && <p className="text-green-500 text-sm mt-4">Profile updated successfully!</p>}
      </form>
    </div>
  );
}
