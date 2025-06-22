
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UmoorTable } from "@/components/umoor/UmoorTable";
import { LogoUpload } from "@/components/umoor/LogoUpload";
import { useUmoors, useCreateUmoor } from "@/hooks/useUmoors";
import { Loader2 } from "lucide-react";

const UmoorManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
  });

  const { data: umoors, isLoading } = useUmoors();
  const createUmoor = useCreateUmoor();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (logoUrl: string) => {
    setFormData(prev => ({ ...prev, logo_url: logoUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await createUmoor.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        logo_url: '',
      });
    } catch (error) {
      console.error('Error creating umoor:', error);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex flex-1">
          {/* Left Sidebar - Add New Umoor Form */}
          <div className="w-80 border-r bg-gray-50/50 p-6">
            <Card>
              <CardHeader>
                <CardTitle>Add new Umoor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter umoor name"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      The name is how it appears in publications
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={generateSlug(formData.name)}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-muted-foreground">
                      Auto-generated URL-friendly version
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of the department"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <LogoUpload
                      currentLogo={formData.logo_url}
                      onLogoUpload={handleLogoUpload}
                      umoorId="temp"
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 120x120px (square format)<br/>
                      Accepted formats: PNG, JPG, SVG (max 2MB)
                    </p>
                  </div>

                  <Separator />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createUmoor.isPending}
                  >
                    {createUmoor.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add new Umoor'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Umoor List */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Umoor Management</h1>
              <p className="text-muted-foreground">
                Manage global department configuration for publications
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <UmoorTable umoors={umoors || []} />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UmoorManagement;
