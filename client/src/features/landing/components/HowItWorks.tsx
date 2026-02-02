const HowItWorks = () => {
  const steps = [
    {
      icon: "📝",
      title: "Create & Personalize Your Trip",
      description: "Add destinations, dates, and categories. Keep everything in one dashboard.",
    },
    {
      icon: "🤝",
      title: "Collaborate with Nomads",
      description: "Invite friends, assign tasks, split budgets, and chat in real time.",
    },
    {
      icon: "🌍",
      title: "Discover & Share",
      description: "Publish trips to the community, explore others' itineraries, or clone them for your next adventure.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-gray-50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full mb-6">
            <span>🔄</span> Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">How It Works</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to transform your travel planning experience
          </p>
        </div>

        <div className="relative">
          {/* Progress line - hidden on mobile */}
          <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-emerald-100 via-blue-100 to-emerald-100"></div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div
                  className="relative bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm transition-colors duration-200 hover:bg-gray-50 hover:border-emerald-200 hover:shadow-md motion-safe:animate-fade-in-up"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="absolute top-3 left-4 w-7 h-7 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                    {index + 1}
                  </div>
                  <div className="text-center pt-2 mb-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto">
                      <span className="text-xl">{step.icon}</span>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
