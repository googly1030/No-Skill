import React from 'react';
import { Navigate } from 'react-router-dom';

// Mock authentication - in a real app, this would be handled by a proper auth system
const isAuthenticated = () => {
  // For demo purposes, we'll always return true
  // In a real app, you would check if the user is logged in
  return true;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;