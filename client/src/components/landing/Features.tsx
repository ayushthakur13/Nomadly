import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const Features = () => {
  const { isAuthenticated } = useSelector((s: any) => s.auth);
  const navigate = useNavigate();

  const handleBottomCTA = () => {
    if (isAuthenticated) navigate('/trips/create');
    else navigate('/auth/login');
  };
  
  const features = [
    {
      group: "Plan with Ease",
      items: [
        {
          icon: "📍",
          title: "Destination & Itinerary Manager",
          description: "Add destinations, set dates, and organize your route in one sleek dashboard."
        },
        {
          icon: "✅",
          title: "Collaborative To-Dos",
          description: "Assign and track shared checklists to keep your crew aligned."
        },
        {
          icon: "💰",
          title: "Budget & Expense Tracker",
          description: "Split costs, log expenses, and manage finances without the stress."
        }
      ]
    },
    {
      group: "Collaborate Seamlessly",
      items: [
        {
          icon: "👥",
          title: "Group Planning",
          description: "Invite friends, set roles, and plan trips together in real-time."
        },
        {
          icon: "💬",
          title: "Trip Chat",
          description: "Stay synced with built-in messaging, scoped to each trip."
        },
        {
          icon: "📸",
          title: "Shared Memories",
          description: "Upload highlights, photos, and notes to relive your journey."
        }
      ]
    },
    {
      group: "Explore & Share",
      items: [
        {
          icon: "🌍",
          title: "Community Trips",
          description: "Discover itineraries from other explorers and get inspired instantly."
        },
        {
          icon: "⚡",
          title: "Trip Cloning",
          description: "Copy public itineraries and personalize them for your adventure."
        },
        {
          icon: "🔒",
          title: "Privacy & Sharing",
          description: "Keep trips private, share with friends, or publish to the world."
        }
      ]
    }
  ];

  const [active, setActive] = useState(0);
  const activeCategory = features[active];

  return (
    <section id="features" className="py-24 sm:py-32 bg-gray-50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading with improved hierarchy */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <span>✨</span> Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Everything You Need for
            <br />
            <span className="text-emerald-600">Smarter Travel</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-base sm:text-lg">
            Designed for modern travelers who want to plan smarter, not harder.
          </p>
        </div>

        {/* Feature Tabs Navigation - improved spacing */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 sm:mb-20">
          {features.map((category, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-200 border ${
                i === active 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/25'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
            >
              {category.group}
            </button>
          ))}
        </div>

        {/* Active Feature Group */}
        <div className="relative">
          {/* Feature Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeCategory.items.map((feature, featureIndex) => (
              <div
                key={featureIndex}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md border border-gray-100 hover:border-emerald-200 transition-colors duration-200"
              >
                <div className="relative text-center">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <span className="text-4xl">{feature.icon}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-emerald-50 rounded-3xl p-12 border border-emerald-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to experience all these features?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of travelers who are already planning smarter with Nomadly</p>
            <button className="btn-primary" onClick={handleBottomCTA}>
              <span className="flex items-center gap-3">
                <span className="text-lg">🚀</span>
                <span>Start Your Journey</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
