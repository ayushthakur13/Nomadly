import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const FinalCTA = () => {
  const { isAuthenticated } = useSelector((s: any) => s.auth);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) navigate('/trips/create');
    else navigate('/auth/login');
  };

  const handleExploreTrips = () => {
    navigate('/explore');
  };

  return (
    <section className="py-24 sm:py-32 bg-emerald-50 relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full mb-6">
          <span>🚀</span> Ready to start?
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Ready for your next adventure?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
          Create your trip today — discover destinations, connect with explorers, and let Nomadly handle the details.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <button onClick={handleGetStarted} className="btn-primary transition-all hover:shadow-lg hover:-translate-y-0.5">
            <span className="flex items-center justify-center gap-3">
              <span className="text-lg">✨</span>
              <span>Get Started Free</span>
            </span>
          </button>
          <button onClick={handleExploreTrips} className="btn-secondary transition-all hover:shadow-md">
            <span className="flex items-center justify-center gap-3">
              <span className="text-lg">🌍</span>
              <span>Explore Trips</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
