// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../config/firebase'; // Assuming you have Firebase auth setup

const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;

  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
