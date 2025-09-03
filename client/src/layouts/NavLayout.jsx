import {Outlet, useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar.jsx";


const NavLayout = () => {

  const navigate = useNavigate();
  return (
    <div>
      <Navbar/>
      <Outlet />
      <BottomBar/>

    </div>
  );
};

export default NavLayout;