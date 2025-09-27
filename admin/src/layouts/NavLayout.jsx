import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar.jsx";


const NavLayout = () => {
  return (
    <div className={"pb-18"}>
      <Outlet />
      <BottomBar/>
    </div>
  );
};

export default NavLayout;