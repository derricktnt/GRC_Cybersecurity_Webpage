import { useState, useEffect } from 'react';
import { Shield, LogOut, Activity } from 'lucide-react';
import { supabase, SUPABASE_AVAILABLE } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { ApiKeyManager } from './components/ApiKeyManager';
import { IpAddressMonitor } from './components/IpAddressMonitor';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [fatalError, setFatalError] = useState<string | null>(null);

  useEffect(() => {
    if (!SUPABASE_AVAILABLE) {
      setFatalError(
        'Missing Supabase environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. Add them to your .env or deployment environment and redeploy.'
      );
      setLoading(false);
      return;
    }

    checkAuth();

    let subscription: any | null = null;

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          setIsAuthenticated(true);
          fetchUserEmail();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserEmail('');
        }
      });
      subscription = data.subscription;
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session) {
      fetchUserEmail();
    }
    setLoading(false);
  };

  const fetchUserEmail = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl bg-white p-6 rounded shadow text-red-700">
          <h2 className="text-lg font-bold mb-2">Configuration error</h2>
          <p className="mb-4">{fatalError}</p>
          <p className="text-sm text-gray-600">
            Locally: add a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and run npm run dev.
            On Vercel: add the variables under Project → Settings → Environment Variables (ensure they start with VITE_).
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm onAuth={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GRC & Cybersecurity Portal</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Activity className="w-3 h-3" />
                  <span>Real-time Monitoring</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{userEmail}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Security Score</h3>
                <Shield className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold">92/100</p>
              <p className="text-xs opacity-80 mt-1">Excellent protection level</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Active Monitors</h3>
                <Activity className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-xs opacity-80 mt-1">Continuous surveillance</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Compliance Status</h3>
                <Shield className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-xs opacity-80 mt-1">SOC2, ISO 27001 certified</p>
            </div>
          </div>

          <ApiKeyManager />
          <IpAddressMonitor />
        </div>
      </main>
    </div>
  );
}

export default App;
