
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Loader2 } from 'lucide-react';
import { useUmoors } from '@/hooks/useUmoors';
import { useNavigate } from 'react-router-dom';

interface UmoorOption {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
}

interface UmoorSelectorProps {
  onSelect: (umoor: UmoorOption) => void;
  onClose: () => void;
}

const UmoorSelector: React.FC<UmoorSelectorProps> = ({ onSelect, onClose }) => {
  const { data: umoors, isLoading } = useUmoors();
  const navigate = useNavigate();

  const handleAddNewUmoor = () => {
    onClose();
    navigate('/umoor');
  };

  const getUmoorLogo = (umoor: any) => {
    if (umoor.logo_url) {
      return umoor.logo_url;
    }
    
    // Fallback emoji based on umoor name
    const emojiMap: { [key: string]: string } = {
      'waaz': '📿',
      'majlis': '🌙',
      'food': '🍽️',
      'accommodation': '🏠',
      'transport': '🚌',
      'health': '⚕️',
      'registration': '📝',
      'general': 'ℹ️'
    };
    
    const key = Object.keys(emojiMap).find(k => 
      umoor.name.toLowerCase().includes(k) || umoor.slug?.includes(k)
    );
    
    return key ? emojiMap[key] : '📋';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Umoor Department</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        <CardContent className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading departments...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {/* Add New Umoor Card */}
              <Button
                variant="outline"
                onClick={handleAddNewUmoor}
                className="h-24 w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                <Plus size={24} className="text-gray-400" />
                <span className="text-xs text-gray-600 font-medium">Add New</span>
              </Button>

              {/* Umoor Cards */}
              {umoors?.map((umoor) => {
                const logoSrc = getUmoorLogo(umoor);
                const isEmoji = logoSrc.length <= 2; // Simple emoji detection
                
                return (
                  <Button
                    key={umoor.id}
                    variant="outline"
                    onClick={() => onSelect({
                      id: umoor.id,
                      name: umoor.name,
                      logo_url: umoor.logo_url,
                      description: umoor.description
                    })}
                    className="h-24 w-full p-3 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {isEmoji ? (
                        <span className="text-2xl">{logoSrc}</span>
                      ) : (
                        <img
                          src={logoSrc}
                          alt={umoor.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<span class="text-2xl">📋</span>';
                          }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight truncate w-full">
                      {umoor.name}
                    </span>
                  </Button>
                );
              })}
            </div>
          )}
          
          {!isLoading && (!umoors || umoors.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <h3 className="text-lg font-medium mb-2">No Umoor departments found</h3>
                <p className="mb-6">Create your first department to get started.</p>
              </div>
              <Button onClick={handleAddNewUmoor} className="bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-2" />
                Add First Umoor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UmoorSelector;
