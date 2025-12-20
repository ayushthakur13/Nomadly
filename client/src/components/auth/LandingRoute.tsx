import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }

const LandingRoute = ({ children }: Props) => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children as React.ReactElement;
};

export default LandingRoute;
