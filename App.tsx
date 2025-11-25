import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserApp from './UserApp';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import PendingRequests from './components/admin/PendingRequests';
import RequestDetail from './components/admin/RequestDetail';
import ActiveGroups from './components/admin/ActiveGroups';
import UsersList from './components/admin/UsersList';
import UserDetail from './components/admin/UserDetail';
import TransactionsList from './components/admin/TransactionsList';
import WithdrawalsList from './components/admin/WithdrawalsList';

function App() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="requests" element={<PendingRequests />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="groups/active" element={<ActiveGroups />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="transactions" element={<TransactionsList />} />
        <Route path="withdrawals" element={<WithdrawalsList />} />
      </Route>

      {/* User App Routes - Catch all other routes */}
      <Route path="*" element={<UserApp />} />
    </Routes>
  );
}

export default App;