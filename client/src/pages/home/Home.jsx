import { Link } from 'react-router-dom';
import PricingPackages from "./PricingPackages.jsx";
import HeroSection from "./Hero.jsx";

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <PricingPackages/>
    </div>
  );
};

export default Home;