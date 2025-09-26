import React, {useState, } from 'react';
import {Link} from 'react-router-dom';
import Button from "./Button.jsx";
import {useLocation} from "react-router-dom";
import {Menu, User} from "lucide-react"
import authStore from "../store/authStore";
import {observer} from "mobx-react-lite";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import {useTranslation} from "react-i18next";

const Navbar = observer(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();

  const {t, i18n} = useTranslation();

  return (
    <nav className=" bg-dark-06/70 backdrop-blur h-[90px] flex items-center sticky w-full top-0 z-50 ">
      <div className="container h-[90px] flex items-center rounded-3xl ">
        <div className="flex items-center   border-dashed w-full justify-between h-full">
          <div className={"flex gap-2 max-md:hidden"}>
            <Button
              text={t("navigation.home")}
              href={"/"}
              isTransparent={location.pathname === "/" ? false : true}
              border={location.pathname === "/" ? false : true}
            />
            <Button
              text={t("navigation.packages")}
              href={"/packages"}
              isTransparent={location.pathname === "/packages" ? false : true}
              border={location.pathname === "/packages" ? false : true}
            />
            <Button
              text={"QR Code"}
              href={"/qr"}
              isTransparent={location.pathname === "/qr" ? false : true}
              border={location.pathname === "/qr" ? false : true}
            />
          </div>
          <div className={'w-[49px]'}></div>

          <Link
            to="/"
            className="md:absolute left-1/2 md:-translate-x-1/2 "
          >
            <span className="text-2xl  font-roboto text-white font-bold"><span className={" text-brown-60"}>Bull</span>Fit</span>
          </Link>



          <div className={"flex items-center gap-2 max-md:hidden"}>
            <LanguageSwitcher/>

            {authStore.isAuthenticated ? (
              <span>
                <Button
                  isTransparent={false}
                  href={"/profile"}
                  CustomIcon={User}
                />
              </span>

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

          <div className="md:hidden flex items-center space-x-4 max-md:w-[49px]">
            {/*<LanguageSwitcher/>*/}



            {/*{authStore.isAuthenticated && (*/}
            {/*  <div className="relative w-[49px] ">*/}
            {/*    <Button*/}
            {/*      className={""}*/}
            {/*      isTransparent={false}*/}
            {/*      href={"/profile"}*/}
            {/*      CustomIcon={User}*/}
            {/*    />*/}

            {/*  </div>*/}
            {/*)}*/}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Navbar;