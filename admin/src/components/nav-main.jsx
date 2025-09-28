import { useSidebar } from "@/components/ui/sidebar"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Link, useNavigate} from "react-router-dom";
import {ScanQrCode} from 'lucide-react'
import {useTranslation} from "react-i18next";

import {LanguageSwitcher} from "./LanguageSwitcher.jsx"

export function NavMain({
  items
}) {
  const {t} = useTranslation();
  const [position, setPosition] = React.useState("bottom")
  const navigate = useNavigate();

  const {
    setOpen,
    setOpenMobile,
  } = useSidebar()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            onClick={() => {
              setOpenMobile(false);
            }}
            tooltip="scan-qr-code"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
            <ScanQrCode />
            <Link className="flex items-center text-sm gap-2" to='/scan-qr'>
              {t("navigation.scan-qr-code")}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} onClick={() => {
              setOpenMobile(false);
            }}>
              <SidebarMenuButton tooltip={item.title} onClick={() => navigate(item.url)}>
                  {item.icon && <item.icon />}
                  {item.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
