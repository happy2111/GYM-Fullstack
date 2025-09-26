import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className={'w-full bg-dark-06'}>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}