import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../../store/authSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Cookies from 'js-cookie';

const Welcome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.firstName || user?.name || user?.email || 'Nomad';

  const handleLogout = async () => {
    try {
      const csrf = Cookies.get('csrf_token') || '';
      await api.post('/auth/logout', {}, {
        headers: { 'x-csrf-token': csrf },
      });
    } catch (_) {
      // ignore server errors
    } finally {
      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">You're logged in</h1>
        <p className="text-gray-600 mb-6">Welcome back, {displayName}.</p>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>
    </div>
  );
};

export default Welcome;
