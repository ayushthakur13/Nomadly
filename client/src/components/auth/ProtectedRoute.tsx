import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children as React.ReactElement;
};

export default ProtectedRoute;
