import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RotateCcw, Save } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserMenu from '@/components/UserMenu';
import { PublicationHeaderRenderer } from '@/components/publication/PublicationHeaderRenderer';
import { PublicationFooterRenderer } from '@/components/publication/PublicationFooterRenderer';
import { useEvent, useUpdateEvent } from '@/hooks/useSupabaseQuery';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';
import { defaultPublicationBranding } from '@/constants/defaultPublicationBranding';
import { mergePublicationBranding } from '@/utils/mergePublicationBranding';
import type { EventPublicationBranding } from '@/types/publicationBranding';
import type { Json } from '@/integrations/supabase/types';

const EventPublicationBrandingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: event, isLoading, error } = useEvent(eventId || '');
  const { data: currentProfile } = useCurrentProfile();
  const updateEventMutation = useUpdateEvent();
  const isAdmin = currentProfile?.role === 'admin';

  const [form, setForm] = useState<EventPublicationBranding>(defaultPublicationBranding);

  useEffect(() => {
    if (event) {
      setForm(mergePublicationBranding(event.publication_branding));
    }
  }, [event]);

  const updateField = <K extends keyof EventPublicationBranding>(
    section: K,
    field: keyof EventPublicationBranding[K],
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!eventId || !isAdmin) return;

    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        updates: { publication_branding: form as unknown as Json },
      });
      toast({
        title: 'Saved',
        description: 'Publication header and footer updated for this event.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save publication branding.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setForm(defaultPublicationBranding);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !event) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                <Button onClick={() => navigate('/events')}>Back to Events</Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/events/${eventId}`)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back to Event
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Header & Footer</h1>
                    <p className="text-sm text-gray-600">{event.name}</p>
                  </div>
                </div>
                <UserMenu />
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 overflow-hidden">
              <div className="lg:w-[420px] flex-shrink-0 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Edit wording</CardTitle>
                    <p className="text-sm text-gray-500 font-normal">
                      Styling is fixed; only text and links can be changed for this event.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Header</h3>
                      <div className="space-y-2">
                        <Label htmlFor="header-line1">Line 1</Label>
                        <Input
                          id="header-line1"
                          value={form.header.line1}
                          onChange={(e) => updateField('header', 'line1', e.target.value)}
                          disabled={!isAdmin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="header-line2">Line 2</Label>
                        <Input
                          id="header-line2"
                          value={form.header.line2}
                          onChange={(e) => updateField('header', 'line2', e.target.value)}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Footer</h3>
                      <div className="space-y-2">
                        <Label htmlFor="footer-title">Title</Label>
                        <Input
                          id="footer-title"
                          value={form.footer.title}
                          onChange={(e) => updateField('footer', 'title', e.target.value)}
                          disabled={!isAdmin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-contact-lead">Contact lead-in</Label>
                        <Textarea
                          id="footer-contact-lead"
                          value={form.footer.contactLead}
                          onChange={(e) => updateField('footer', 'contactLead', e.target.value)}
                          disabled={!isAdmin}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="footer-whatsapp-label">WhatsApp label</Label>
                          <Input
                            id="footer-whatsapp-label"
                            value={form.footer.whatsappLabel}
                            onChange={(e) => updateField('footer', 'whatsappLabel', e.target.value)}
                            disabled={!isAdmin}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="footer-whatsapp-url">WhatsApp URL</Label>
                          <Input
                            id="footer-whatsapp-url"
                            value={form.footer.whatsappUrl}
                            onChange={(e) => updateField('footer', 'whatsappUrl', e.target.value)}
                            disabled={!isAdmin}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-contact-middle">Text before phone link</Label>
                        <Input
                          id="footer-contact-middle"
                          value={form.footer.contactMiddle}
                          onChange={(e) => updateField('footer', 'contactMiddle', e.target.value)}
                          disabled={!isAdmin}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="footer-phone-label">Phone display</Label>
                          <Input
                            id="footer-phone-label"
                            value={form.footer.phoneLabel}
                            onChange={(e) => updateField('footer', 'phoneLabel', e.target.value)}
                            disabled={!isAdmin}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="footer-phone-tel">Phone (tel digits)</Label>
                          <Input
                            id="footer-phone-tel"
                            value={form.footer.phoneTel}
                            onChange={(e) => updateField('footer', 'phoneTel', e.target.value)}
                            disabled={!isAdmin}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-hours">Hours text</Label>
                        <Input
                          id="footer-hours"
                          value={form.footer.hoursText}
                          onChange={(e) => updateField('footer', 'hoursText', e.target.value)}
                          disabled={!isAdmin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-note">Note</Label>
                        <Textarea
                          id="footer-note"
                          value={form.footer.note}
                          onChange={(e) => updateField('footer', 'note', e.target.value)}
                          disabled={!isAdmin}
                          rows={3}
                        />
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleSave}
                          disabled={updateEventMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          {updateEventMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw size={16} />
                          Reset to defaults
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-sm font-medium text-gray-700">Live preview</h2>
                </div>
                <div className="max-w-4xl mx-auto px-8 py-8 relative bg-[#FAF5ED]">
                  <PublicationHeaderRenderer
                    title="Sample Publication"
                    breadcrumb={`${event.name} • Sample Location`}
                    showDecorative={true}
                    headerLines={form.header}
                  />
                  <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-lg">
                    Publication content appears here
                  </div>
                  <PublicationFooterRenderer footer={form.footer} />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EventPublicationBrandingPage;
