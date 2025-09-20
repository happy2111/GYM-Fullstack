import React, {useEffect, useState} from 'react';
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
import Home from './pages/home/Home.jsx';
import authStore from './store/authStore';
import {Toaster} from "react-hot-toast";
import GoogleAuthCallBack from "./pages/GoogleAuthCallBack.jsx";
import NavLayout from "./layouts/NavLayout.jsx";
import ProfileLayout from "./layouts/ProfileLayout.jsx";
import AccountPreference from "./pages/profile/AccountPreference.jsx";
import Sessions from "./pages/profile/Sessions.jsx";
import api from "./http/index.js";
import Payments from "./pages/profile/Payments.jsx";
import PricingPackages from "./pages/home/PricingPackages.jsx";
import MembershipHistory from "./pages/profile/MembershipHistory.jsx";
import QRCodePage from "./pages/QRCodePage.jsx";
import {useTranslation} from "react-i18next";
import i18n from "./i18n.js";




// Protected Route Component
const ProtectedRoute = observer(({children}) => {
  if (!authStore.isAuthenticated) {
    return <Navigate
      to="/login"
      replace
    />;
  }
  return children;
});




const App = observer(() => {
  const [isTelegram, setIsTelegram] = useState(false)

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
      {/*<AuthLayout>*/}
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
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path={"/auth/google/callback"}
            element={<GoogleAuthCallBack />}
          />

          {/* Protected Routes */}
          <Route path={"/"} element={<NavLayout/>}>
            <Route
              path=""
              element={
                <Home />
              }
            />

            <Route
              path="packages"
              element={
                <PricingPackages />
              }
            />

            <Route
              path={"qr"}
              element={<ProtectedRoute><QRCodePage/></ProtectedRoute>}
              />


            <Route path={"profile"} element={<ProtectedRoute><ProfileLayout/></ProtectedRoute>}>
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





          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate
              to="/"
              replace
            />}
          />


        </Routes>
      {/*</AuthLayout>*/}
    </Router>
  );
});

export default App;