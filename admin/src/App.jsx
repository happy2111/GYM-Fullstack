import React, { useEffect } from 'react';
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







const App = observer(() => {

  useEffect(() => {
    authStore.initializeAuth();
  }, []);

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




  return (
    <Router>
        <Toaster />
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
            <Route path="profile" element={<ProfileLayout />}>
              <Route path="" element={window.innerWidth > 600 && <Navigate to="account-preference" replace />} />
              <Route
                path="account-preference"
                element={<AccountPreference />}
              />
              <Route path={"sessions"} element={<Sessions/>}/>
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