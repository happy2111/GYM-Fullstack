import React, {useEffect, useState} from 'react';
import {
  Settings,
  User,
  Shield,
  ArrowLeft,
  LogOut,
  BanknoteArrowUp,
  History
} from 'lucide-react';
import {Outlet, useLocation, Link, useNavigate} from "react-router-dom"
import ProfileInfo from "../components/ProfileInfo.jsx";
import authStore from "../store/authStore.js";
import membershipStore from "../store/membershipStore.js";
import {observer} from "mobx-react-lite";

const initialMenuItems = [
  { icon: User, label: 'Account preferences', active: true, href: "account-preference" },
  { icon: Shield, label: 'Sessions', active: false, href: "sessions"},
  { icon: BanknoteArrowUp, label: 'Payments', active: false, href: "payments"},
  { icon: History, label: 'Memberships', active: false, href: "membership-history"},

  // { icon: Eye, label: 'Visibility', active: false },
  // { icon: Database, label: 'Data privacy', active: false },
  // { icon: Megaphone, label: 'Advertising data', active: false },
  // { icon: Bell, label: 'Notifications', active: false },
];

const ProfileLayout = observer(() => {
  useEffect(() => {
    authStore.getSessions();
    authStore.getPayments();
    membershipStore.getAllMemberships();
  }, []);


  const [menuItems, setMenuItems] = useState(initialMenuItems);

  function handleActive(href) {
    const updatedItems = menuItems.map(item => ({
      ...item,
      active: item.href === href
    }));
    setMenuItems(updatedItems);
  }




  const {pathname} = useLocation();
  const navigate = useNavigate();
  const isProfileRoot = pathname.includes("/profile") && pathname.length <= "/profile/".length;




  return (
    <div className={`min-h-screen max-md:pt-30 pb-32`} style={{ backgroundColor: 'var(--color-dark-06)', color: 'var(--color-gray-90)' }}>
      <div className={"container"}>
        <ProfileInfo isProfileRoot={isProfileRoot}/>
      </div>

      <div className="flex container gap-6">



        {/* Sidebar */}
        <div className={`w-full md:w-1/4 p-6 rounded-2xl ${!isProfileRoot && "max-md:hidden"}`} style={{ backgroundColor: 'var(--color-dark-10)' }}>
          <div className="flex items-center gap-2 mb-8">
            <Settings className="w-5 h-5" style={{ color: 'var(--color-gray-70)' }} />
            <h1 className="text-lg font-medium" style={{ color: 'var(--color-gray-90)' }}>Settings</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link

                  onClick={() => handleActive(item.href)}
                  to={`/profile/${item.href}`}
                  key={index}
                  className={`max-md:!bg-dark-12 max-md:!text-gray-99 flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    item.active ? 'text-white' : 'hover:bg-gray-700/30'
                  }`}
                  style={{
                    backgroundColor: item.active ? 'var(--color-dark-20)' : 'transparent',
                    color: item.active ? 'var(--color-gray-99)' : 'var(--color-gray-70)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={authStore.logout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors `}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log out</span>
            </button>
          </nav>
        </div>

        {/*Button*/}
        <div className={`flex w-3/4 max-md:w-full flex-col ${isProfileRoot && "hidden"}`}>
          <div className={`flex mb-6 items-center space-x-2 md:hidden ${isProfileRoot && "hidden"}`}>
            <button
              onClick={() => navigate(-1)}
              className="bg-dark-10 rounded-2xl px-6 py-3 flex items-center text-dark-35 hover:text-white transition-colors"
            >
              <ArrowLeft
                size={20}
                className="mr-2"
              />
              Back
            </button>
          </div>

          {/* Main Content */}
          <Outlet/>
        </div>



      </div>

      <style jsx>{`
        input:focus, textarea:focus {
          ring: 2px solid var(--color-brown-70);
        }
        
        button:hover {
          opacity: 0.9;
        }
        
        .sidebar-item:hover {
          background-color: var(--color-dark-15);
        }
      `}</style>
    </div>
  );
});

export default ProfileLayout;