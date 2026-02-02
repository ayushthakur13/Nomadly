import {
  Hero,
  HowItWorks,
  Benefits,
  Features,
  Testimonials,
  FAQ,
  FinalCTA,
} from "../components";
import { Footer } from '@/ui/common'

const LandingPage = () => {
  return (
    <>
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Features />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
};

export default LandingPage;
