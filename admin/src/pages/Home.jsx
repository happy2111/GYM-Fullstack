import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      home
      <Link to={"/profile"}>Profile</Link>
    </div>
  );
};

export default Home;