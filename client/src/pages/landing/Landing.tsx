import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Hero from '../../components/landing/Hero';
import HowItWorks from '../../components/landing/HowItWorks';
import Benefits from '../../components/landing/Benefits';
import MockPreview from '../../components/landing/MockPreview';
import Features from '../../components/landing/Features';
import Testimonials from '../../components/landing/Testimonials';
import FAQ from '../../components/landing/FAQ';
import FinalCTA from '../../components/landing/FinalCTA';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        {/* <MockPreview /> */}
        <Features />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
