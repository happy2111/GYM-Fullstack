import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import { Home, Package, User, LogIn, QrCode } from 'lucide-react';
import authStore from '../store/authStore';
import { observer } from 'mobx-react-lite';
import i18n from "../i18n.js";
import {useTranslation} from "react-i18next";

const BottomBar = observer(() => {
  const location = useLocation();
  const navigate = useNavigate()
  const [isTelegram, setIsTelegram] = useState(false);
  const {t} = useTranslation();
  const [navItems, setNavItems] = useState([
    {
      name: t('navigation.packages'),
      href: "/packages",
      icon: Package,
    },
    {
      name: t('navigation.qr'),
      href: "/qr",
      icon: QrCode,
    },
  ]);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
      i18n.changeLanguage(window.Telegram.WebApp.initDataUnsafe.user.language_code);
      setIsTelegram(true);
    }
  }, []);

  useEffect(() => {
    if (!isTelegram) {
      setNavItems((prev) => {
        if (prev.some((item) => item.href === "/")) {
          return prev; // уже добавлен
        }
        return [
          {
            name: t('navigation.home'),
            href: "/",
            icon: Home,
          },
          ...prev,
        ];
      });
    }else {
      navigate('/packages');
    }
  }, [isTelegram]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-dark-06 border-t border-gray-700/50">
        <div className="container">
          <div className="flex items-center justify-around h-[70px] px-4">
            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brown-60 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Auth Section */}
            {authStore.isAuthenticated ? (
              <Link
                to="/profile"
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === '/profile'
                    ? 'bg-brown-60 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <User size={20} />
                <span className="text-xs font-medium">{t('navigation.profile')}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === '/login' || location.pathname === '/register'
                    ? 'bg-brown-60 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <LogIn size={20} />
                <span className="text-xs font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
});

export default BottomBar;