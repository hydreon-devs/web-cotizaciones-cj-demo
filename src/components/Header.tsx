import { useState } from "react";
import { LogOut, Menu, Settings, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoCJ from "@/assets/LogoCJ.png";
import logoCJNegro from "@/assets/LogoCJNegro.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada exitosamente");
    navigate("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { to: "/plantillas", label: "Plantillas" },
    { to: "/nueva", label: "Nueva Cotización" },
    { to: "/", label: "Historial" },
  ];

  const isActiveLink = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
            <img src={logoCJ} alt="CJ Producciones" className="h-10 dark:hidden" />
            <img src={logoCJNegro} alt="CJ Producciones" className="h-10 hidden dark:block" />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm hover:text-primary transition-colors ${
                  isActiveLink(link.to)
                    ? "text-primary underline underline-offset-4"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />

          {/* Desktop user dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 md:gap-3 h-auto py-1.5 px-2 md:px-3 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user ? getInitials(user.email) : "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm text-foreground">{user?.email || "Usuario"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-muted-foreground">
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user?.email || "email@ejemplo.com"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">
                <Link to="/configuracion" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile navigation sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <img src={logoCJ} alt="CJ Producciones" className="h-12 dark:hidden" />
              <img src={logoCJNegro} alt="CJ Producciones" className="h-12 hidden dark:block" />
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-6">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                    isActiveLink(link.to)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{user ? getInitials(user.email) : "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.email || "Usuario"}</span>
                <span className="text-xs text-muted-foreground">Mi cuenta</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              <SheetClose asChild>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  Perfil
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/configuracion"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </Link>
              </SheetClose>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
