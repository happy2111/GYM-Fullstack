import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
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


const App = observer(() => {
  const [isTelegram, setIsTelegram] = useState(true)

  useEffect(() => {
    const TelegramLogin = async () => {
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.log("Обычный браузер: Telegram WebApp не найден");
        return;
      }

      const tg = window.Telegram.WebApp;
      console.log("initDataUnsafe:", tg.initDataUnsafe);

      if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        console.log("Нет данных Telegram пользователя (браузер или тест без Telegram)");
        return;
      }

      try {
        console.log(`Window Telegram: ${window.Telegram} `)
        console.log(`Telegram WebApp: ${window.Telegram.WebApp} `)

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
          <Route path="/register" element={<Register />} />
          <Route path={"/auth/google/callback"} element={<GoogleAuthCallBack />} />

          {/* Admin-only Protected Routes */}
          <Route path="/" element={<AuthLayout><AdminRoute><NavLayout/></AdminRoute></AuthLayout>}>
            <Route index element={<Home />} />
            <Route path="scan-qr" element={<ScanQrCodePage />} />
            <Route path="payments" element={<Payments />} />
            <Route path="users" element={<Users />} />
            <Route path="visits" element={<Visits/>} />


            <Route path="profile" element={<ProfileLayout />}>
              <Route path="" element={window.innerWidth > 600 && <Navigate to="account-preference" replace />} />
              <Route
                path="account-preference"
                element={<AccountPreference />}
              />
              <Route path={"sessions"} element={<Sessions/>}/>
              <Route path={"payments"} element={<Payments/>}/>
              <Route path={"membership-history"} element={<MembershipHistory/>}/>
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
  );
});

export default App;