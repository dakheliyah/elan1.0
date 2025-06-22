
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EventManagement from "./pages/EventManagement";
import EventDetail from "./pages/EventDetail";
import LocationDetail from "./pages/LocationDetail";
import UmoorManagement from "./pages/UmoorManagement";
import MediaLibrary from "./pages/MediaLibrary";
import MediaOptimization from "./pages/MediaOptimization";
import NotFound from "./pages/NotFound";
import ProtectedRoute from './components/ProtectedRoute';
import InviteAcceptance from './pages/InviteAcceptance';
import PublicationEditorPage from './pages/PublicationEditor';
import ExportModule from "./pages/ExportModule";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/invite/:token" element={<InviteAcceptance />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/events" element={<EventManagement />} />
                <Route path="/events/:eventId" element={<EventDetail />} />
                <Route path="/events/:eventId/locations/:locationId" element={<LocationDetail />} />
                <Route path="/events/:eventId/locations/:locationId/publications/:publicationId/edit" element={<PublicationEditorPage />} />
                <Route path="/umoor" element={<UmoorManagement />} />
                <Route path="/export" element={<ExportModule />} />
                <Route path="/media" element={<MediaLibrary />} />
                <Route path="/media/optimization" element={<MediaOptimization />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
