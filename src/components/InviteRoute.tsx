
import React from 'react';
import { Route } from 'react-router-dom';
import InviteAcceptance from '@/pages/InviteAcceptance';

export const InviteRoute = () => (
  <Route path="/invite/:invitationId" element={<InviteAcceptance />} />
);

export default InviteRoute;
