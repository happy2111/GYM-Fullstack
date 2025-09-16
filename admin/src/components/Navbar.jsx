import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Button from "./Button.jsx";
import {useLocation} from "react-router-dom";
import {ShoppingCart, Menu, User, Sidebar} from "lucide-react"
import authStore from "../store/authStore";
import {observer} from "mobx-react-lite";

const Navbar = observer(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  return (
    <nav className="max-md:hidden bg-dark-06 h-[90px] flex items-center sticky top-0 z-50 ">
      <div className="container h-[90px] flex items-center overflow-hidden rounded-3xl ">
        <div className="flex items-center   border-dashed w-full justify-between h-full">
          <div className={"flex gap-2 max-md:hidden"}>
            <Button
              text={"Home"}
              href={"/"}
              isTransparent={location.pathname === "/" ? false : true}
              border={location.pathname === "/" ? false : true}
            />
            <Button
              text={"Scan QR Code"}
              href={"/scan-qr"}
              isTransparent={location.pathname === "/scan-qr" ? false : true}
              border={location.pathname === "/scan-qr" ? false : true}
            />
            <Button
              text={"Payments"}
              href={"/payments"}
              isTransparent={location.pathname === "/payments" ? false : true}
              border={location.pathname === "/payments" ? false : true}
            />
          </div>
          <div className="md:hidden flex items-center space-x-4">
            <Button
              text={""}
              isTransparent={false}
              CustomIcon={Menu}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>

          <Link
            to="/"
            className="md:absolute left-1/2 md:-translate-x-1/2 space-x-2"
          >
            <span className="text-2xl font-bold font-roboto text-white ">VeloPro</span>
          </Link>

          <div className={"flex gap-2 max-md:hidden"}>
            {authStore.isAuthenticated ? (
              <Button
                isTransparent={false}
                href={"/profile"}
                CustomIcon={User}
              />
            ) : (
              <>
                <Button
                  text={"Sign Up"}
                  isTransparent={false}
                  href={"/register"}
                />
                <Button
                  text={"Log In"}
                  isTransparent={false}
                  href={"/login"}
                  className={"!bg-brown-60"}
                />
              </>
            )}

          </div>

          {/* Mobile меню */}
          <div className="md:hidden flex items-center space-x-4">


            {authStore.isAuthenticated && (
              <div className="relative">
                <Button
                  isTransparent={false}
                  href={"/profile"}
                  CustomIcon={User}
                />

              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;