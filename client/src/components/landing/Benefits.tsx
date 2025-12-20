const Benefits = () => {
  const benefits = [
    {
      icon: "🧭",
      title: "All-in-One Travel Hub",
      description: "Trips, tasks, budgets, memories — everything in one sleek dashboard."
    },
    {
      icon: "🌐",
      title: "Community-Driven Discovery",
      description: "Invite friends, assign tasks, and make decisions together without group chat chaos."
    },
    {
      icon: "🤖",
      title: "Smart & Effortless (Upcoming)",
      description: "AI trip planner, auto-budget tracking, and task reminders."
    },
    {
      icon: "🔒",
      title: "Private When You Need, Social When You Want",
      description: "Share your adventures publicly or keep them private — your choice."
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full mb-6">
            <span>✨</span> Why choose us?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">Why Nomadly?</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Designed for dreamers, built for planners. Here's why Nomadly makes every trip better.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="group relative bg-white border border-gray-100 p-6 md:p-8 rounded-2xl hover:shadow-md hover:border-emerald-200 transition-colors duration-200">
              <div className="relative">
                <div className="text-4xl mb-6">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
