import { Link } from 'react-router-dom';
import PricingPackages from "./PricingPackages.jsx";
import HeroSection from "./Hero.jsx";
import Footer from "../../components/Footer.jsx";

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <PricingPackages/>
      <Footer/>
    </div>
  );
};

export default Home;