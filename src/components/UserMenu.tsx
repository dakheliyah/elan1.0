
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

const UserMenu = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
      <User size={16} />
      <span>{user.email}</span>
    </div>
  );
};

export default UserMenu;
