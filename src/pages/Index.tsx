
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else if (!loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
    </div>
  );
};

export default Index;
