import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import AuthPage from './pages/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setInitialized } from './store/authSlice';
import { closeCreateTripModal } from './store/createTripModalSlice';
import api, { setAccessToken } from './services/api';
import Navbar from './components/common/Navbar';
import Landing from './pages/landing/Landing';
import Dashboard from './pages/dashboard/Dashboard';
import Explore from './pages/explore/Explore';
import ExploreTrip from './pages/explore/ExploreTrip';
import MyTrips from './pages/trips/MyTrips';
import TripDetails from './pages/trips/TripDetails';
import CreateTrip from './pages/trips/CreateTrip';
import Profile from './pages/profile/Profile';
import CreateTripModal from './components/trips/CreateTripModal';
import LandingRoute from './components/auth/LandingRoute';
import PublicRoute from './components/auth/PublicRoute';

function AppContent() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state: any) => state.auth);
  const { isOpen } = useSelector((state: any) => state.createTripModal);

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
      <Navbar />
      <div className="bg-gray-50 pt-16">
        <Routes>
        <Route
          path="/"
          element={
            <LandingRoute>
              <Landing />
            </LandingRoute>
          }
        />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route
          path="/explore"
          element={
            <PublicRoute>
              <Explore />
            </PublicRoute>
          }
        />
        <Route
          path="/explore/trips/:tripId"
          element={
            <PublicRoute>
              <ExploreTrip />
            </PublicRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      </div>

      {isOpen && (
        <CreateTripModal
          isOpen={isOpen}
          onClose={() => dispatch(closeCreateTripModal())}
        />
      )}

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
