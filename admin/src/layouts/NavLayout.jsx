import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar.jsx";


const NavLayout = () => {
  return (
    <div>
      {/*<Navbar/>*/}
      <Outlet />
      <BottomBar/>

    </div>
  );
};

export default NavLayout;