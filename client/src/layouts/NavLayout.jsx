import {Outlet} from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar.jsx";
import {useEffect, useState} from "react";


const NavLayout = () => {
  const [isTelegram, setIsTelegram] = useState(false)
  useEffect(() => {
    if (window.Telegram?.WebApp?.user) {
      setIsTelegram(true);
      console.log("Platform:", window.Telegram.WebApp.platform);
    }
  }, []);
  return (
    <div data-telegram={isTelegram}>
      <Navbar/>
      <main className={"pb-20 min-h-[calc(100vh-5rem)] md:pb-0"}>
        <Outlet />
      </main>
      <BottomBar/>

    </div>
  );
};

export default NavLayout;