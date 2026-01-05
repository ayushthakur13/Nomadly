import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks';
import { AUTH_ROUTES } from '../constants/authConstants';

interface LandingRouteProps {
  children: ReactNode;
}

const LandingRoute = ({ children }: LandingRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.DASHBOARD} replace />;
  }
  
  return <>{children}</>;
};

export default LandingRoute;
