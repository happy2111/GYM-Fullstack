import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar"
import {observer} from "mobx-react-lite";


  const SidebarLayout = observer(({ children }: { children: React.ReactNode }) => {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  })

export default SidebarLayout