import { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Is Nomadly free to use?",
      answer: "Yes, core features free forever. Premium coming soon."
    },
    {
      question: "Do I need friends on Nomadly?",
      answer: "Nope. Works for solo travelers too."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. Only your invited members see your trip."
    },
    {
      question: "Can I share my trip publicly?",
      answer: "Yes. Share with the world or keep it just for your crew."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-full mb-6">
            <span>💬</span> Got questions? We've got answers.
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">Everything you need to know about Nomadly</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 transition-all duration-300 transform">
                  <span className={`text-lg font-bold transition-transform duration-300 ${openIndex === index ? 'rotate-45' : 'rotate-0'}`}>
                    +
                  </span>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6 pt-2">
                  <div className="w-full h-px bg-gradient-to-r from-emerald-200 to-transparent mb-4"></div>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;