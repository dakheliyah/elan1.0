
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentProfile } from '@/hooks/useProfiles';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: currentProfile, isLoading: profileLoading } = useCurrentProfile();

  useEffect(() => {
    if (user && !profileLoading) {
      const userRole = currentProfile?.role;
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/dashboard');
      } else {
        // Viewers and editors go to events
        navigate('/events');
      }
    } else if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, currentProfile, profileLoading, navigate]);

  // Show loading spinner while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
    </div>
  );
};

export default Index;
