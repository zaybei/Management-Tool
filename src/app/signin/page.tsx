'use client';
import { useState, FormEvent } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state

  const router = useRouter();

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Set loading to true

    try {
      const { data, error: signinError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signinError) {
        throw signinError;
      }

      // Fetch the user's role from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user?.id)
        .single();

      if (userError) {
        throw userError;
      }

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/member');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
    finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleSignin} className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
            type="submit"
            className={`w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
      </form>
    </div>
  );
}
