import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Process from '../components/Process';
import Pricing from '../components/Pricing';
import Franchise from '../components/Franchise';
import JobVacancies from '../components/JobVacancies';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="font-inter">
      <Header />
      <Hero />
      <About />
      <Services />
      <Process />
      <Pricing />
      <Franchise />
      <JobVacancies />
      <FAQ />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
