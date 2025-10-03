import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../../store/authSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Cookies from 'js-cookie';
import Navbar from '../../components/common/Navbar';

const MyTrips = () => {
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
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-1">Welcome back, {displayName}!</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Logout
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">This is a placeholder. Your trips will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
