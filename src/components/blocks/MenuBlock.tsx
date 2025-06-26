import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Edit2, Trash2, Plus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MenuBlockData, MenuItemData } from '../../pages/PublicationEditor';

interface MenuBlockProps {
  data: MenuBlockData;
  onChange: (data: Partial<MenuBlockData>) => void;
}

const MenuBlock: React.FC<MenuBlockProps> = ({ data, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Skip header row and process data
        const items: MenuItemData[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          // Only require name (first column), nutrition and allergens are optional
          if (row && row[0] && row[0].toString().trim()) {
            items.push({
              name: row[0]?.toString() || '',
              calories: row[1]?.toString() || '',
              allergens: row[2]?.toString() || ''
            });
          }
        }

        onChange({
          items,
          fileName: file.name,
          header: (data && typeof data === 'object' && 'header' in data && typeof data.header === 'string') ? data.header : undefined
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please ensure it has at least a Name column.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddItem = () => {
    setEditingItem({ name: '', calories: '', allergens: '' });
    setEditingIndex(-1);
    setIsEditing(true);
  };

  const handleEditItem = (item: MenuItemData, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    const newItems = [...(data?.items || [])];
    if (editingIndex >= 0) {
      newItems[editingIndex] = editingItem;
    } else {
      newItems.push(editingItem);
    }

    onChange({ items: newItems, fileName: data?.fileName, header: data?.header });
    setIsEditing(false);
    setEditingItem(null);
    setEditingIndex(-1);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = (data?.items || []).filter((_, i) => i !== index);
    onChange({ items: newItems, fileName: data?.fileName, header: data?.header });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    setEditingIndex(-1);
  };

  return (
    <div className="space-y-4">
      {/* Header Input Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Menu Header (Optional)
        </label>
        <input
          type="text"
          value={data?.header || ''}
          onChange={(e) => onChange({ items: data?.items || [], fileName: data?.fileName, header: e.target.value })}
          placeholder="Enter menu header text..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Upload Section */}
      {(!data?.items || data.items.length === 0) && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Menu Excel File</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload an Excel file with columns: Name (required), Nutrition (optional), Allergens (optional)
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/Menu_Template_New.xls';
                link.download = 'Menu_Template_New.xls';
                link.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Menu Items Display */}
      {(data?.items && data.items.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Menu Items</Badge>
              {data?.fileName && (
                <span className="text-sm text-gray-500">from {data.fileName}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace File
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Menu Items List */}
          <div className="space-y-3">
            {(data?.items || []).map((item, index) => (
              <div key={index}>
                <Card className="p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{item.name}</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Nutrition:</span> {item.calories}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Allergens:</span> {item.allergens}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item, index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
                {index < (data?.items?.length || 0) - 1 && (
                  <div className="border-t border-dashed border-gray-300 my-3"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingIndex >= 0 ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="calories">Nutrition</Label>
                  <Input
                    id="calories"
                    value={editingItem.calories}
                    onChange={(e) => setEditingItem({ ...editingItem, calories: e.target.value })}
                    placeholder="e.g., 115 kcal"
                  />
                </div>
                
                <div>
                  <Label htmlFor="allergens">Allergens</Label>
                  <Input
                    id="allergens"
                    value={editingItem.allergens}
                    onChange={(e) => setEditingItem({ ...editingItem, allergens: e.target.value })}
                    placeholder="e.g., Contains gluten, milk & nuts"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveItem} className="flex-1">
                  {editingIndex >= 0 ? 'Update' : 'Add'} Item
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default MenuBlock;