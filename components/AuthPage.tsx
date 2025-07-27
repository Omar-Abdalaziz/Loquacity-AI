import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
       <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight">
          Loquacity <span className="text-sky-400">AI</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Sign in or create an account to start searching.
        </p>
      </div>

      <div className="w-full max-w-sm p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-300 block mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300 block mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-500 rounded-md text-white font-semibold transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {error && <p className="text-sm text-center text-red-400">{error}</p>}
        {message && <p className="text-sm text-center text-green-400">{message}</p>}

        <p className="text-sm text-center text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
            }}
            className="font-medium text-sky-400 hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
