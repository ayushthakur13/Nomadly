import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import AuthPage from './pages/auth/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Welcome from './pages/welcome/Welcome';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './store/authSlice';
import api, { setAccessToken } from './services/api';
import Cookies from 'js-cookie';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Bootstrap auth by attempting refresh (if cookies present)
    (async () => {
      try {
        const csrf = Cookies.get('csrf_token');
        if (!csrf) return; // no session cookie, skip
        const { data } = await api.post('/auth/refresh', {}, {
          headers: { 'x-csrf-token': csrf },
        });
        const { accessToken, user } = data;
        setAccessToken(accessToken);
        dispatch(loginSuccess({ token: accessToken, user }));
      } catch (_) {
        // ignore
      }
    })();
  }, [dispatch]);

  return (
    <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth/*" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/welcome" element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
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
