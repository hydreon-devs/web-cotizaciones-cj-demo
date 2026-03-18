import { Sidebar, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { Settings, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { roles } from "@/utils/const"
import { NavLink } from "react-router-dom"

type SidebarItem = {
  title: string;
  url?: string;
  icon: React.ComponentType;
  role?: string[];
  type?: string;
};

const ConfigItems: SidebarItem[] = [
  {
    title: "Usuarios",
    icon: User,
    role: [roles.ADMIN, roles.EMPLEADO],
    type: "group"
  },
  {
    title: "Perfil",
    url: "/configuracion/perfil",
    icon: User,
    role: [roles.ADMIN, roles.EMPLEADO],
    type: "content"
  },
  {
    title: "Usuarios",
    url: "/configuracion/usuarios",
    icon: User,
    role: [roles.ADMIN],
    type: "content"
  },
  {
    title: "Configuración",
    icon: Settings,
    role: [roles.ADMIN],
    type: "group"
  },
  {
    title: "Productos",
    url: "/configuracion/productos",
    icon: Settings,
    role: [roles.ADMIN],
    type: "content"
  },
  {
    title: "Servicios",
    url: "/configuracion/servicios",
    icon: Settings,
    role: [roles.ADMIN],
    type: "content"
  }
]

export function AppSidebarConfig() {
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarInset >
        <SidebarContent>
        <SidebarGroup className="flex flex-col gap-y-6">
          <SidebarHeader>
            Configuración
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu>
              {ConfigItems.map((item) => {
                if (item.role && !item.role.includes(user?.role)) {
                  return null;
                }
                if (item.type && item.type === "group" ){
                  return (
                    <SidebarGroupLabel key={`group-${item.title}`}>
                      {item.title}
                    </SidebarGroupLabel>
                  )
                }
                return (
                <SidebarMenuItem key={`item-${item.title}`}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url ?? ""} onClick={handleNavClick}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      </SidebarInset>
    </Sidebar>
  )
}
