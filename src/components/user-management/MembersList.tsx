
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Shield, Crown, User, Save, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  locations: string[];
  avatar?: string;
  joinedDate: string;
}

interface Location {
  id: string;
  name: string;
}

interface CurrentUser {
  id: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface MembersListProps {
  users: User[];
  locations: Location[];
  currentUser: CurrentUser;
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
  onSelectAll: () => void;
  onUserUpdate: (userId: string, updates: Partial<User>) => void;
  onUserDelete: (user: User) => void;
  filters: {
    role: string;
    search: string;
    sortBy: string;
  };
}

const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    icon: Crown,
    description: 'Full access to all features and settings'
  },
  editor: {
    label: 'Editor',
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    icon: Shield,
    description: 'Can manage content and locations'
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-green-100 text-green-800 hover:bg-green-100',
    icon: User,
    description: 'Can view content only'
  }
} as const;

const MembersList: React.FC<MembersListProps> = ({
  users,
  locations,
  currentUser,
  selectedUsers,
  onSelectionChange,
  onSelectAll,
  onUserUpdate,
  onUserDelete,
  filters
}) => {
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<{
    role: string;
    locations: string[];
  }>({ role: '', locations: [] });
  const [isSaving, setIsSaving] = React.useState(false);

  // Filter and sort users
  const filteredUsers = React.useMemo(() => {
    let filtered = users.filter(user => {
      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesSearch = !filters.search || 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesRole && matchesSearch;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'role':
          const roleOrder = { admin: 0, editor: 1, viewer: 2 };
          return roleOrder[a.role] - roleOrder[b.role];
        case 'joinedDate':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [users, filters]);

  const adminCount = users.filter(u => u.role === 'admin').length;

  const canRemoveUser = (user: User) => {
    if (user.id === currentUser.id) return false;
    if (currentUser.role === 'viewer') return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'editor' && user.role === 'viewer') return true;
    return false;
  };

  const canChangeRole = (user: User) => {
    if (user.id === currentUser.id) return false;
    return currentUser.role === 'admin';
  };

  const getAvailableRoleChanges = (user: User) => {
    if (!canChangeRole(user)) return [];
    
    const roles = ['admin', 'editor', 'viewer'] as const;
    return roles.filter(role => {
      if (role === user.role) return false;
      // Don't allow demoting the last admin
      if (user.role === 'admin' && adminCount === 1 && role !== 'admin') return false;
      return true;
    });
  };

  const getLocationNames = (locationIds: string[]) => {
    return locationIds
      .map(id => locations.find(loc => loc.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId]);
    } else {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAllChange = () => {
    const selectableUsers = filteredUsers.filter(user => user.id !== currentUser.id);
    if (selectedUsers.length === selectableUsers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(selectableUsers.map(user => user.id));
    }
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({
      role: user.role,
      locations: [...user.locations]
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ role: '', locations: [] });
  };

  const toggleEditLocation = (locationId: string) => {
    setEditForm(prev => ({
      ...prev,
      locations: prev.locations.includes(locationId)
        ? prev.locations.filter(id => id !== locationId)
        : [...prev.locations, locationId]
    }));
  };

  const saveUserEdit = async (userId: string) => {
    if (!editForm.role) return;

    setIsSaving(true);
    try {
      await onUserUpdate(userId, {
        role: editForm.role as User['role'],
        locations: editForm.locations
      });
      setEditingUserId(null);
      setEditForm({ role: '', locations: [] });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickRoleChange = async (userId: string, newRole: User['role']) => {
    try {
      await onUserUpdate(userId, { role: newRole });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const allSelectableSelected = React.useMemo(() => {
    const selectableUsers = filteredUsers.filter(user => user.id !== currentUser.id);
    return selectableUsers.length > 0 && selectedUsers.length === selectableUsers.length;
  }, [filteredUsers, currentUser.id, selectedUsers]);

  const someSelected = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.filter(user => user.id !== currentUser.id).length;

  return (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      {filteredUsers.length > 1 && (
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id="select-all"
            checked={allSelectableSelected}
            ref={(el) => {
              if (el) {
                const checkbox = el.querySelector('button') as HTMLButtonElement;
                if (checkbox) {
                  (checkbox as any).indeterminate = someSelected;
                }
              }
            }}
            onCheckedChange={handleSelectAllChange}
          />
          <Label htmlFor="select-all" className="text-sm font-medium">
            Select all members ({filteredUsers.filter(user => user.id !== currentUser.id).length})
          </Label>
        </div>
      )}

      {/* Members List */}
      {filteredUsers.map((user) => {
        const RoleIcon = roleConfig[user.role].icon;
        const isEditing = editingUserId === user.id;
        const canRemove = canRemoveUser(user);
        const canEditRole = canChangeRole(user);
        const availableRoles = getAvailableRoleChanges(user);
        const isSelected = selectedUsers.includes(user.id);
        const canSelect = user.id !== currentUser.id;
        
        return (
          <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {canSelect && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleUserSelect(user.id, !!checked)}
                  />
                )}
                
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="text-sm text-gray-500 ml-2">(You)</span>
                      )}
                    </h3>
                    {!isEditing ? (
                      <Badge className={roleConfig[user.role].color}>
                        <RoleIcon size={12} className="mr-1" />
                        {roleConfig[user.role].label}
                      </Badge>
                    ) : (
                      <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleConfig).map(([roleKey, role]) => {
                            const RoleIcon = role.icon;
                            return (
                              <SelectItem key={roleKey} value={roleKey}>
                                <div className="flex items-center gap-2">
                                  <Badge className={role.color}>
                                    <RoleIcon size={12} className="mr-1" />
                                    {role.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {!isEditing ? (
                      <>
                        <span>
                          Locations: {getLocationNames(user.locations) || 'No access'}
                        </span>
                        <span>•</span>
                        <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Location Access:</Label>
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {locations.map((location) => (
                            <div key={location.id} className="flex items-center space-x-1">
                              <Checkbox
                                id={`edit-location-${user.id}-${location.id}`}
                                checked={editForm.locations.includes(location.id)}
                                onCheckedChange={() => toggleEditLocation(location.id)}
                                className="h-3 w-3"
                              />
                              <Label
                                htmlFor={`edit-location-${user.id}-${location.id}`}
                                className="text-xs font-normal"
                              >
                                {location.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => startEditUser(user)}
                      disabled={!canEditRole}
                    >
                      <Edit size={14} className="mr-2" />
                      Edit Member
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canEditRole && availableRoles.length > 0 && (
                      <>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Shield size={14} className="mr-2" />
                            Change Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {availableRoles.map((roleKey) => {
                              const role = roleConfig[roleKey];
                              const RoleIcon = role.icon;
                              return (
                                <DropdownMenuItem
                                  key={roleKey}
                                  onClick={() => handleQuickRoleChange(user.id, roleKey)}
                                >
                                  <RoleIcon size={14} className="mr-2" />
                                  {role.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => onUserDelete(user)}
                      disabled={!canRemove}
                      className={canRemove ? "text-red-600 focus:text-red-600" : "text-gray-400"}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Remove from Event
                      {!canRemove && user.id === currentUser.id && (
                        <span className="ml-auto text-xs">(Can't remove yourself)</span>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    <X size={16} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveUserEdit(user.id)}
                    disabled={isSaving}
                    className="flex items-center gap-1"
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {roleConfig[user.role].description}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No members found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MembersList;
