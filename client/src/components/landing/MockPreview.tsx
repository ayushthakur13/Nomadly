import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MockPreview = () => {
  const { isAuthenticated } = useSelector((s: any) => s.auth);
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    if (isAuthenticated) navigate('/trips/create');
    else navigate('/auth/login');
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full mb-6">
              <span>📱</span> Live Preview
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">See Nomadly in Action</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Experience how effortlessly you can plan, track, and collaborate with your travel buddies.
              Everything you need — all in one place.
            </p>
            <button 
              onClick={handleStartPlanning}
              className="btn-primary"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">🚀</span>
                <span>Start Planning</span>
              </span>
            </button>
          </div>

          <div className="relative">
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-2xl">
              <img 
                src="/images/mock-dashboard.png" 
                alt="Nomadly App Preview - Dashboard showing trip planning interface" 
                className="w-full rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockPreview;
