import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../../store/authSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Cookies from 'js-cookie';
import Navbar from '../../components/common/Navbar';

const Dashboard = () => {
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
    } catch {
      // ignore server errors
    } finally {
      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    }
  };

  const quickActions = [
    {
      icon: "✈️",
      title: "Create New Trip",
      description: "Start planning your next adventure",
      action: () => navigate('/trips'),
      color: "bg-emerald-500"
    },
    {
      icon: "🗺️",
      title: "View My Trips",
      description: "Manage your existing trips",
      action: () => navigate('/trips'),
      color: "bg-blue-500"
    },
    {
      icon: "🧭",
      title: "Explore Trips",
      description: "Discover popular destinations",
      action: () => navigate('/explore'),
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to plan your next adventure? Let's get started.
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">0</div>
            <p className="text-gray-600">Active Trips</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <p className="text-gray-600">Total Destinations</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
            <p className="text-gray-600">Trip Memories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;