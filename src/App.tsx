import { useState, useEffect } from 'react';
import { Shield, LogOut, Activity, BarChart3, LayoutDashboard } from 'lucide-react';
import { supabase, SUPABASE_AVAILABLE } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { ApiKeyManager } from './components/ApiKeyManager';
import { IpAddressMonitor } from './components/IpAddressMonitor';
import { Reports } from './components/Reports';

type View = 'dashboard' | 'reports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Supabase availability check:', {
          available: SUPABASE_AVAILABLE,
          hasClient: !!supabase
        });

        if (!SUPABASE_AVAILABLE) {
          setFatalError(
            'Missing Supabase environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. Add them to your .env or deployment environment and redeploy.'
          );
          setLoading(false);
          return;
        }

        await checkAuth();
      } catch (error) {
        console.error('Initialization error:', error);
        setFatalError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    init();

    let subscription: any | null = null;

    if (supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange((event) => {
          (async () => {
            try {
              if (event === 'SIGNED_IN') {
                setIsAuthenticated(true);
                await fetchUserEmail();
              } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setUserEmail('');
              }
            } catch (error) {
              console.error('Auth state change error:', error);
            }
          })();
        });
        subscription = data.subscription;
      } catch (error) {
        console.error('Auth listener setup error:', error);
      }
    }

    return () => {
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
      }
      setIsAuthenticated(!!session);
      if (session) {
        await fetchUserEmail();
      }
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
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
          <div className="flex gap-1 border-t border-gray-200 -mb-px">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reports
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
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

            <ApiKeyManager isDemoMode={isDemoMode} />
            <IpAddressMonitor isDemoMode={isDemoMode} />
          </div>
        ) : (
          <Reports isDemoMode={isDemoMode} />
        )}
      </main>
    </div>
  );
}

export default App;
