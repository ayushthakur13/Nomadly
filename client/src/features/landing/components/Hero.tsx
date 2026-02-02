import heroIllustraion from "@/assets/illustrations/hero-travelers-1.webp"
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Hero = () => {
  const { isAuthenticated } = useSelector((s: any) => s.auth);
  const navigate = useNavigate();

  const handleStartFree = () => {
    if (isAuthenticated) navigate('/trips/create');
    else navigate('/auth/login');
  };

  const handleExploreTrips = () => {
    navigate('/explore');
  };

  return (
    <section id="hero" className="relative overflow-hidden min-h-screen flex items-center">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
        <div className="space-y-10">
          <div className="space-y-8">
            <div className="flex flex-col items-start">
              <span className="badge-soft">
                <span className='animate-bounce'>📍</span> Find your vibe. Plan smarter. Travel further.
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-gray-900 leading-tight">
              The modern way to <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 bg-clip-text text-transparent animate-gradient">plan trips</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Nomadly isn't just a planner — it's your travel hub. Discover destinations, manage budgets, chat with your group, and even clone trips from fellow explorers.
            </p>
          </div>

          {/* Primary CTA more prominent than secondary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={handleStartFree} 
              className="btn-primary transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-lg">✨</span>
                <span>Start Free</span>
              </span>
            </button>
            <button 
              onClick={handleExploreTrips} 
              className="btn-secondary transition-all hover:shadow-md"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-lg">🌍</span>
                <span>Explore Trips</span>
              </span>
            </button>
          </div>
        </div>

        <div className="hidden md:block">
          <img 
            src={heroIllustraion}
            alt="Travel planning illustration"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
