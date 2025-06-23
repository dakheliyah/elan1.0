import React, { useEffect } from 'react';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'editor' | 'viewer')[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/events' 
}: RoleProtectedRouteProps) => {
  const { data: currentProfile, isLoading } = useCurrentProfile();
  const { toast } = useToast();

  const userRole = currentProfile?.role;
  const isUnauthorized = !isLoading && (!userRole || !allowedRoles.includes(userRole));

  // Show toast notification for unauthorized access
  useEffect(() => {
    if (isUnauthorized) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isUnauthorized, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (isUnauthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;