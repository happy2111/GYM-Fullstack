import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings, IconTicket,
  IconUsers,
} from "@tabler/icons-react"

import {Tag ,DoorOpen, BanknoteArrowDown} from  'lucide-react'

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Link} from "react-router-dom";
import authStore from "@/store/authStore.js";
import {observer} from "mobx-react-lite";
import i18n from "@/i18n";
import {LanguageSwitcher} from "@/components/LanguageSwitcher.jsx";

const data = {
  navMain: [
    {
      title: i18n.t("navigation.dashboard"),
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: i18n.t("navigation.users"),
      url: "/users",
      icon: IconUsers,
    },
    {
      title: i18n.t("navigation.membership"),
      url: "/memberships",
      icon: IconTicket,
    },
    {
      title: i18n.t("navigation.tariffs"),
      url: "/tariffs",
      icon: Tag,
    },
    {
      title: i18n.t("navigation.visits"),
      url: "/visits",
      icon: DoorOpen,
    },
    {
      title:  i18n.t("navigation.payments"),
      url: "/payments",
      icon: BanknoteArrowDown,
    },

  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [

  ],
}

const AppSidebar = observer(({...props}) => {


  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link
                to="/"
                className=""
              >
                <span className="text-2xl  font-roboto text-white font-bold"><span className={" text-brown-60"}>Bull</span>Fit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <LanguageSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
})

export  {AppSidebar};
