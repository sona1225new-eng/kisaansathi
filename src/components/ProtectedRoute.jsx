import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, ready } = useAuthContext();
  const location = useLocation();
  if (!ready) return <div className="min-h-screen grid place-items-center text-green-700 font-semibold">Loading Kisaan Saathi…</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
