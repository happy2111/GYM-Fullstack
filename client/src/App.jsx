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
import Profile from './layouts/ProfileLayout.jsx';
import Home from './pages/Home';
import authStore from './store/authStore';
import {Toaster} from "react-hot-toast";
import GoogleAuthCallBack from "./pages/GoogleAuthCallBack.jsx";
import NavLayout from "./layouts/NavLayout.jsx";
import ProfileLayout from "./layouts/ProfileLayout.jsx";
import AccountPreference from "./pages/profile/AccountPreference.jsx";
import Sessions from "./pages/profile/Sessions.jsx";
import api from "./http/index.js";



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
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    const user = tg.initDataUnsafe?.user;
    if (!user) {
      console.warn("Нет данных о пользователе из Telegram");
      return;
    }

    const sendUserData = async () => {
      try {
        const res = await api.post("/api/auth/telegram", {
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            photoUrl: user.photo_url || null,
        });

        console.log(res)


      } catch (err) {
        console.error("Ошибка сети при отправке данных Telegram:", err);
      }
    };

    sendUserData();

    console.log("Full initDataUnsafe:", tg.initDataUnsafe);
    alert(JSON.stringify(tg.initDataUnsafe, null, 2));
  }, []);




  return (
    <Router>
      {/*<AuthLayout>*/}
        <Toaster />
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

            <Route path={"profile"} element={<ProtectedRoute><ProfileLayout/></ProtectedRoute>}>
              <Route path="" element={window.innerWidth > 600 && <Navigate to="account-preference" replace />} />
              <Route
                path="account-preference"
                element={<AccountPreference />}
              />
              <Route path={"sessions"} element={<Sessions/>}/>
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