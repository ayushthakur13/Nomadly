import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import store from './store';
import AuthPage from './pages/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { loginSuccess, setInitialized } from './store/authSlice';
import api, { setAccessToken } from './services/api';
import PublicNavbar from './components/common/PublicNavbar';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/landing/Landing';
import Dashboard from './pages/dashboard/Dashboard';
import Explore from './pages/explore/Explore';
import ExploreTrip from './pages/explore/ExploreTrip';
import MyTrips from './pages/trips/MyTrips';
import TripDashboard from './pages/trips/TripDashboard';
import TripDestinations from './pages/trips/TripDestinations';
import TripTasks from './pages/trips/TripTasks';
import TripBudget from './pages/trips/TripBudget';
import TripAccommodations from './pages/trips/TripAccommodations';
import TripMembers from './pages/trips/TripMembers';
import TripMemories from './pages/trips/TripMemories';
import TripChat from './pages/trips/TripChat';
import CreateTrip from './pages/trips/CreateTrip';
import Profile from './pages/profile/Profile';
import LandingRoute from './components/auth/LandingRoute';
import PublicRoute from './components/auth/PublicRoute';

const PublicLayout = ({ children }: { children: ReactNode }) => (
  <>
    <PublicNavbar />
    <div className="bg-gray-50 pt-16">{children}</div>
  </>
);

const ConditionalLayout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  return isAuthenticated ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <PublicLayout>{children}</PublicLayout>
  );
};

function AppContent() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state: any) => state.auth);

  useEffect(() => {
    (async () => {
      try {
        const { getCsrfToken } = await import('./utils/auth');
        const csrf = getCsrfToken();
        if (!csrf) {
          dispatch(setInitialized());
          return;
        }
        const { data } = await api.post('/auth/refresh', {}, {
          headers: { 'x-csrf-token': csrf },
        });
        const { accessToken, user } = data.data;
        setAccessToken(accessToken);
        dispatch(loginSuccess({ token: accessToken, user }));
      } catch {
        dispatch(setInitialized());
      }
    })();
  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <LandingRoute>
              <PublicLayout>
                <Landing />
              </PublicLayout>
            </LandingRoute>
          }
        />

        <Route
          path="/auth/*"
          element={
            <PublicLayout>
              <AuthPage />
            </PublicLayout>
          }
        />

        <Route
          path="/explore"
          element={
            <ConditionalLayout>
              <PublicRoute>
                <Explore />
              </PublicRoute>
            </ConditionalLayout>
          }
        />

        <Route
          path="/explore/trips/:tripId"
          element={
            <ConditionalLayout>
              <PublicRoute>
                <ExploreTrip />
              </PublicRoute>
            </ConditionalLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyTrips />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateTrip />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Trip nested routes with shared TripDashboard layout */}
        <Route
          path="/trips/:tripId/*"
          element={
            <ProtectedRoute>
              <TripDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff' },
        }}
      />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
