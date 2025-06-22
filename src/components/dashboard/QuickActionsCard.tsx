
import React from 'react';
import { Plus, Calendar, FileText, Users, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuickActionsCard() {
  const actions = [
    {
      title: 'Create New Event',
      icon: Calendar,
      href: '/events',
      description: 'Start a new event'
    },
    {
      title: 'New Publication',
      icon: FileText,
      href: '/events',
      description: 'Create content'
    },
    {
      title: 'Export Publications',
      icon: Download,
      href: '/export',
      description: 'Export featured publications'
    },
    {
      title: 'Invite Member',
      icon: Users,
      href: '/events',
      description: 'Add team member'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              asChild
              variant="outline"
              className="w-full justify-start h-auto p-3"
            >
              <Link to={action.href}>
                <div className="flex items-center gap-3">
                  <action.icon className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-gray-600">{action.description}</div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
