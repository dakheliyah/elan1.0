
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/events');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Elan</h1>
          <p className="mt-2 text-sm text-gray-600">Event Management Platform</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Elan</h2>
          <p className="text-gray-600 mb-6">
            Manage your events, locations, and publications all in one place.
          </p>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
