import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { AuthPage } from './components/AuthPage';
import { SearchPage } from './components/SearchPage';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-400">Loading...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 antialiased">
      {!session ? (
        <AuthPage />
      ) : (
        <SearchPage key={session.user.id} session={session} />
      )}
    </div>
  );
};

export default App;