
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ChevronDown,
  Package
} from "lucide-react";
import { Umoor } from "@/services/umoors";
import { useDeleteUmoor, useDeleteMultipleUmoors } from "@/hooks/useUmoors";
import { UmoorEditDialog } from "./UmoorEditDialog";

interface UmoorTableProps {
  umoors: Umoor[];
}

export const UmoorTable: React.FC<UmoorTableProps> = ({ umoors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingUmoor, setEditingUmoor] = useState<Umoor | null>(null);

  const deleteUmoor = useDeleteUmoor();
  const deleteMultiple = useDeleteMultipleUmoors();

  // Filter umoors based on search term
  const filteredUmoors = umoors.filter(umoor =>
    umoor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (umoor.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    umoor.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredUmoors.map(umoor => umoor.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle individual checkbox
  const handleSelectItem = (umoorId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, umoorId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== umoorId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await deleteMultiple.mutateAsync(selectedIds);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting umoors:', error);
    }
  };

  // Handle single delete
  const handleDelete = async (umoorId: string) => {
    try {
      await deleteUmoor.mutateAsync(umoorId);
    } catch (error) {
      console.error('Error deleting umoor:', error);
    }
  };

  // Get first letter for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Umoor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={handleBulkDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} items selected
              </span>
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredUmoors.length} items
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredUmoors.length && filteredUmoors.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-20">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Usage Count</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUmoors.map((umoor) => (
              <TableRow 
                key={umoor.id} 
                className="hover:bg-gray-50/50 cursor-pointer"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(umoor.id)}
                    onCheckedChange={(checked) => handleSelectItem(umoor.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage src={umoor.logo_url || ''} alt={umoor.name} />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      {umoor.logo_url ? (
                        <Package className="h-5 w-5" />
                      ) : (
                        getInitials(umoor.name)
                      )}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{umoor.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {umoor.description || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {umoor.slug}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    0 {/* TODO: Implement usage count */}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingUmoor(umoor)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(umoor.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredUmoors.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'No umoors found matching your search.' : 'No umoors created yet.'}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingUmoor && (
        <UmoorEditDialog
          umoor={editingUmoor}
          isOpen={!!editingUmoor}
          onClose={() => setEditingUmoor(null)}
        />
      )}
    </div>
  );
};
