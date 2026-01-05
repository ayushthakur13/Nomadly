import {
  Hero,
  HowItWorks,
  Benefits,
  Features,
  Testimonials,
  FAQ,
  FinalCTA,
  Footer
} from "../../components";

const Landing = () => {
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

export default Landing;
