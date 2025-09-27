import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanQrCode , BanknoteArrowDown} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import i18n from '@/i18n';

const BottomBar = observer(() => {
  const location = useLocation();

  const navItems = [
    {
      name: i18n.t("navigation.dashboard_short") ,
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: i18n.t("navigation.payments"),
      href: '/payments',
      icon: BanknoteArrowDown,
    },
    {
      name: i18n.t("navigation.scan-qr-code_short"),
      href: '/scan-qr',
      icon: ScanQrCode,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-dark-06 border-t border-gray-700/50">
        <div className="container ">
          <div className="flex items-center justify-around  px-4 h-10">
            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex text-center flex-col items-center justify-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
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
          </div>
        </div>
      </nav>
    </div>
  );
});

export default BottomBar;