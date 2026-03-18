import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarConfig } from "@/components/componentsConfiguracion/sideBar";
import { Outlet } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";

export default function Configuracion () {
  return (
    <SidebarProvider style={{ "--sidebar-width": "10rem" } as React.CSSProperties}>
      <div className="flex min-h-[calc(100vh-64px)] w-full">
        <AppSidebarConfig />

        <div className="flex-1 p-4 md:p-6">
          <div className="mb-4 md:hidden">
            <SidebarTrigger />
          </div>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </div>
    </SidebarProvider>
  )
}