import { Toaster } from '@/components/ui/toaster'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Home2 from './pages/Home2';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className='fixed inset-0 flex items-center justify-center'>
        <div className='w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin'></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <nav className='sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <span className='font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent'>
            Success Planner A/B Lab
          </span>
        </div>
        <div className='flex items-center space-x-3 text-sm font-medium'>
          <Link
            to='/'
            className='px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors'
          >
            Variant A: Home (Single Runner)
          </Link>
          <Link
            to='/home2'
            className='px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm'
          >
            Variant B: Home 2 (Swarm Runner)
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home2' element={<Home2 />} />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
