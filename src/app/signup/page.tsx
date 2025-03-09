'use client';
import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Set loading to true

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        throw signupError;
      }

      // Insert user data into the users table
      const { error: userError } = await supabase
        .from('users')
        .insert([{ id: data.user?.id, email, full_name: fullName, role }]);

      if (userError) {
        throw userError;
      }

      // Show success message and wait for email verification
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Listen for email verification
  useEffect(() => {
    if (success) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            setError(userError.message);
            return;
          }

          // Redirect based on role
          if (userData.role === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/member');
          }
        }
      });

      return () => authListener.subscription.unsubscribe();
    }
  }, [success, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      {success ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96 text-center">
          <p className="text-green-500 mb-4">
            A verification email has been sent to your email address. Please verify your email to continue.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
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
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading} // Disable button while loading
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
}