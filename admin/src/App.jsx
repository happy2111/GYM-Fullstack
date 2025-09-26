import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import {observer} from 'mobx-react-lite';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import authStore from './store/authStore';
import {Toaster} from "react-hot-toast";
import GoogleAuthCallBack from "./pages/GoogleAuthCallBack.jsx";
import NavLayout from "./layouts/NavLayout.jsx";
import ProfileLayout from "./layouts/ProfileLayout.jsx";
import AccountPreference from "./pages/profile/AccountPreference.jsx";
import Sessions from "./pages/profile/Sessions.jsx";
import ScanQrCodePage from "./pages/ScanQrCodePage.jsx";
import Payments from "./pages/Payments.jsx";
import AdminRoute from "./Routes/AdminRoute.jsx";
import MembershipHistory from "./pages/profile/MembershipHistory.jsx"
import i18n from "./i18n.js";
import Users from "./pages/Users.jsx";
import Visits from "./pages/Visits.jsx";
import Tariffs from "./pages/Tariffs.jsx";
import Memberships from "./pages/Memberships.jsx";
import Dashboard from "./pages/dashboard/page.js";
import { ThemeProvider } from "@/components/theme-provider"
import SidebarLayout from "@/layouts/SidebarLayout.js";


const App = observer(() => {
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    console.log(`%c
          _____                _____          
         /\\    \\              |\\    \\         
        /::\\____\\             |:\\____\\        
       /:::/    /             |::|   |        
      /:::/    /              |::|   |        
     /:::/    /               |::|   |        
    /:::/____/                |::|   |        
   /::::\\    \\                |::|   |        
  /::::::\\    \\   _____       |::|___|______  
 /:::/\\:::\\    \\ /\\    \\      /::::::::\\    \\ 
/:::/  \\:::\\    /::\\____\\    /::::::::::\\____\\
\\::/    \\:::\\  /:::/    /   /:::/~~~~/~~      
 \\/____/ \\:::\\/:::/    /   /:::/    /         
          \\::::::/    /   /:::/    /          
           \\::::/    /   /:::/    /           
           /:::/    /    \\::/    /            
          /:::/    /      \\/____/             
         /:::/    /                           
        /:::/    /                            
        \\::/    /                             
         \\/____/                              
                                              
\n%chttps://github.com/happy2111
`,
      "color:#00ffcc; font-size:12px; font-family:monospace;",
      "color:#4ea1ff; font-size:12px; font-family:monospace; text-decoration:underline;");

  }, [])

  useEffect(() => {
    const TelegramLogin = async () => {
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.log("Обычный браузер: Telegram WebApp не найден");
        return;
      }

      const tg = window.Telegram.WebApp;
      // console.log("initDataUnsafe:", tg.initDataUnsafe);

      if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        console.log("Нет данных Telegram пользователя (браузер или тест без Telegram)");
        return;
      }

      try {
        // console.log(`Window Telegram: ${window.Telegram} `)
        // console.log(`Telegram WebApp: ${window.Telegram.WebApp} `)

        await authStore.telegramLogin();
        console.log("Telegram login successful");
      } catch (err) {
        console.error("Ошибка сети при отправке данных Telegram:", err);
      }
    };

    TelegramLogin();
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
      i18n.changeLanguage(window.Telegram.WebApp.initDataUnsafe.user.language_code);
      setIsTelegram(true);
      console.log("Platform:", window.Telegram.WebApp.platform);
    }
  }, []);

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
        <Toaster
          toastOptions={{
            // Define default options
            className: '',
            duration: 3000,
            removeDelay: 1000,
            style: {
              background: '#363636',
              color: '#fff',
              marginTop: `${isTelegram ? '70px' : '0px'}`
            },

            // Default options for specific types
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}/>


        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          {/*<Route path="/register" element={<Register />} />*/}
          <Route path={"/auth/google/callback"} element={<GoogleAuthCallBack />} />

          {/* Admin-only Protected Routes */}
          <Route path="/" element={<AuthLayout><AdminRoute><SidebarLayout><NavLayout/></SidebarLayout></AdminRoute></AuthLayout>}>
            <Route path={""} element={<Navigate to="dashboard" replace />} />
            <Route index path="dashboard" element={<Dashboard />} />
            {/*<Route index element={<Home />} />*/}
            <Route path="scan-qr" element={<ScanQrCodePage />} />
            <Route path="payments" element={<Payments />} />
            <Route path="users" element={<Users />} />
            <Route path="visits" element={<Visits/>} />
            <Route path="tariffs" element={<Tariffs/>} />
            <Route path="memberships" element={<Memberships/>} />



            <Route path="profile" element={<AuthLayout><AdminRoute><ProfileLayout/></AdminRoute></AuthLayout>}>
              <Route path="" element={<Outlet />} />
              <Route path="account-preference" element={<AccountPreference />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="payments" element={<Payments />} />
              <Route path="membership-history" element={<MembershipHistory />} />
            </Route>

          </Route>



          <Route
            path="*"
            element={<Navigate
              to="/"
              replace
            />}
          />
        </Routes>
      </Router>
      </ThemeProvider>
    </>
  );
});

export default App;