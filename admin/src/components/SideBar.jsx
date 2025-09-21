import {Link} from "react-router-dom";
import {Menu, User, X} from "lucide-react";
import Button from "./Button.jsx";
import React from "react";
const SideBar = ({sidebarOpen, setSidebarOpen, sidebarItems, isAdmin}) => {
  return (
    <>
      <div className={`h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${!isAdmin && "md:hidden"}  lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-06/50 backdrop-blur-2xl  shadow-lg border-r border-dark-12`}>
        <div className={`flex items-center justify-between ${isAdmin ? "h-[80px]  " : "h-[123px]"} px-6 `}>
          <div className="flex items-center space-x-3 ">
            <Link to={"/"} className="text-2xl font-bold text-white">VeloPro</Link>
          </div>
          <Button
            isTransparent={false}
            CustomIcon={X}
            onClick={() => setSidebarOpen(false)}
            className={`${isAdmin && "lg:hidden"}`}
          />
        </div>
        <nav className="mt-6 px-4 h-[calc(100%-123px)]">
          <div className="space-y-2">
            {
              sidebarItems.map((item, index) => (
                <Button
                  key={index}
                  text={item.text}
                  isTransparent={location.pathname === item.href ? false : true}
                  border={location.pathname === item.href ? false : true}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={item?.className}
                />
              ))
            }
            {/*{isAuthenticated ? (*/}
            {/*  <Button*/}
            {/*    isTransparent={location.pathname === `${isAdmin ? "/admin/profile" : "/profile"}` ? false : true}*/}
            {/*    border={location.pathname === `${isAdmin ? "/admin/profile" : "/profile"}` ? false : true}*/}
            {/*    href={isAdmin ? "/admin/profile" : "/profile"}*/}
            {/*    onClick={() => setSidebarOpen(false)}*/}
            {/*    CustomIcon={User}*/}
            {/*  />*/}
            {/*) : (*/}
            {/*  <>*/}
            {/*    <Button*/}
            {/*      text={"Sign Up"}*/}
            {/*      isTransparent={false}*/}
            {/*      href={"/register"}*/}
            {/*      onClick={() => setSidebarOpen(false)}*/}
            {/*    />*/}
            {/*    <Button*/}
            {/*      text={"Log In"}*/}
            {/*      isTransparent={false}*/}
            {/*      href={"/login"}*/}
            {/*      className={"!bg-brown-60"}*/}
            {/*      onClick={() => setSidebarOpen(false)}*/}
            {/*    />*/}
            {/*  </>*/}
            {/*)}*/}
          </div>
        </nav>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>

  );
};

export default SideBar;