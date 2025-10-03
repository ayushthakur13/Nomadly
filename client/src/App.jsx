import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import AuthPage from './pages/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setInitialized } from './store/authSlice';
import api, { setAccessToken } from './services/api';
import Cookies from 'js-cookie';
import Landing from './pages/landing/Landing';
import Dashboard from './pages/dashboard/Dashboard';
import MyTrips from './pages/trips/MyTrips';

function AppContent() {
  const dispatch = useDispatch();
  const { initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    // Bootstrap auth by attempting refresh (if cookies present)
    (async () => {
      try {
        const csrf = Cookies.get('csrf_token');
        if (!csrf) {
          dispatch(setInitialized());
          return;
        }
        const { data } = await api.post('/auth/refresh', {}, {
          headers: { 'x-csrf-token': csrf },
        });
        const { accessToken, user } = data;
        setAccessToken(accessToken);
        dispatch(loginSuccess({ token: accessToken, user }));
      } catch (_) {
        dispatch(setInitialized());
      }
    })();
  }, [dispatch]);

  // Show loading spinner until auth state is initialized
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
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/*" element={<AuthPage />} />

        {/* Protected Routes */}
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
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
