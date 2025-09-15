import { Link } from 'react-router-dom';
import PricingPackages from "./PricingPackages.jsx";

const Home = () => {
  return (
    <div>
      <PricingPackages/>
      home
      <Link to={"/profile"}>Profile</Link>
    </div>
  );
};

export default Home;