import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LandingRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  // Redirect authenticated users to home
  if (isAuthenticated && token) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default LandingRoute;