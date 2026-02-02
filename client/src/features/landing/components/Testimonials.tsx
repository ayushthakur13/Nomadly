import Icon from '@/ui/icon/Icon';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Nomadly replaced our messy WhatsApp planning — finally, a travel tool that feels made for us.",
      user: {
        name: "Ayush P.",
        role: "Startup Founder",
        image: "/images/users/ayush_image.jpg"
      }
    },
    {
      text: "Cloning trips saved me hours. I found an India backpacking route and adapted it instantly.",
      user: {
        name: "Daksh C.",
        role: "Travel Blogger",
        image: "/images/users/daksh_image.jpeg"
      }
    },
    {
      text: "Nomadly makes travel planning collaborative, not chaotic.",
      user: {
        name: "Vanshik V.",
        role: "UX Designer",
        image: "/images/users/vanshik_image.jpeg"
      }
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full mb-6">
            <span>💬</span> Testimonials
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Travelers Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real stories from happy wanderers who've planned unforgettable journeys with Nomadly.
          </p>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative bg-white/70 backdrop-blur-sm border border-gray-100 p-6 md:p-8 rounded-2xl hover:shadow-xl hover:shadow-emerald-500/10 transition-shadow duration-300 hover:border-emerald-200">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative">
                <div className="mb-6">
                  <Icon name="quote" size={32} className="text-emerald-500 mb-4" />
                  <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center pt-4 border-t border-gray-100">
                  <img 
                    src={testimonial.user.image} 
                    alt={testimonial.user.name}
                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.user.name}</p>
                    <p className="text-emerald-600 text-sm font-medium">{testimonial.user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
