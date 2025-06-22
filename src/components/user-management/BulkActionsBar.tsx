
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, Users, Shield, MapPin, Trash2, Crown, User } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkRoleChange: (role: string) => void;
  onBulkLocationUpdate: () => void;
  onBulkRemove: () => void;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    icon: Crown,
  },
  editor: {
    label: 'Editor',
    icon: Shield,
  },
  viewer: {
    label: 'Viewer',
    icon: User,
  }
} as const;

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkRoleChange,
  onBulkLocationUpdate,
  onBulkRemove
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users size={14} />
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X size={14} />
          </Button>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Shield size={14} />
                Change Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(roleConfig).map(([roleKey, role]) => {
                const RoleIcon = role.icon;
                return (
                  <DropdownMenuItem
                    key={roleKey}
                    onClick={() => onBulkRoleChange(roleKey)}
                  >
                    <RoleIcon size={14} className="mr-2" />
                    {role.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkLocationUpdate}
            className="flex items-center gap-2"
          >
            <MapPin size={14} />
            Update Locations
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkRemove}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Remove Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
