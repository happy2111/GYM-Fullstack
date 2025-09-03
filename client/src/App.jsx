import React from 'react';
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
import Profile from './pages/Profile';
import Home from './pages/Home';
import authStore from './store/authStore';
import {Toaster} from "react-hot-toast";
import GoogleAuthCallBack from "./pages/GoogleAuthCallBack.jsx";

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
  return (
    <Router>
      <AuthLayout>
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
          <Route
            path="/"
            element={
              <Home />
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate
              to="/"
              replace
            />}
          />


        </Routes>
      </AuthLayout>
    </Router>
  );
});

export default App;