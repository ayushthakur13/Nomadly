import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import store from './store';
import { AuthPage, ProtectedRoute, LandingRoute, PublicRoute } from './features/auth';
import { loginSuccess, setInitialized } from './features/auth/store/authSlice';
import api, { setAccessToken, initializeTokenSync } from './services/api';
import { getCsrfToken } from './services/csrf';
import { PublicNavbar, AppLayout } from './components';
import { Landing, Dashboard, Explore, ExploreTrip, Profile } from './pages';
import { MyTripsPage } from '@/features/trips/list';
import { CreateTripPage } from '@/features/trips/create';
import { TripDashboardPage } from '@/features/trips/dashboard';

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
                <MyTripsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateTripPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Trip nested routes with feature-first dashboard */}
        <Route
          path="/trips/:tripId/*"
          element={
            <ProtectedRoute>
              <TripDashboardPage />
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
  // Initialize Redux store subscription for token sync (Problem 2 fix)
  // Makes Redux the single source of truth for access tokens
  initializeTokenSync(store);
  
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
