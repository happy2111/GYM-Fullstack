import { Link } from 'react-router-dom';
import PricingPackages from "./PricingPackages.jsx";
import HeroSection from "./Hero.jsx";
import Footer from "../../components/Footer.jsx";
import { useLocation } from "react-router-dom";
import PageHelmet from "@/components/PageHelmet";
import meta from "@/meta";

const Home = () => {
  const { pathname } = useLocation();
  return (
    <>
      <PageHelmet {...meta[pathname]} />
      <div>
        <HeroSection/>
        <PricingPackages/>
        <Footer/>
      </div>
    </>

  );
};

export default Home;