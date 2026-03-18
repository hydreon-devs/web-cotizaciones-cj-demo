import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Layaut from "./layaut";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NuevaCotizacion from "./pages/NuevaCotizacion";
import Plantillas from "./pages/Plantillas";
import Servicios from "./pages/Servicios";
import Productos from "./pages/Productos";
import CotizacionDetalle from "./pages/CotizacionDetalle";
import NotFound from "./pages/NotFound";
import Configuracion from "./pages/Configuracion";
import ConfiguracionPerfil from "./pages/configuracion/Perfil";
import ConfiguracionUsuarios from "./pages/configuracion/Usuarios";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvite from "./pages/AcceptInvite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layaut />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Index />} />
                <Route path="/cotizaciones/:id" element={<CotizacionDetalle />} />
                <Route path="/nueva" element={<NuevaCotizacion />} />
                <Route path="/plantillas" element={<Plantillas />} />
                <Route path="/configuracion" element={<Configuracion />}>
                  <Route index element={<Navigate to="/configuracion/perfil" replace />} />
                  <Route path="perfil" element={<ConfiguracionPerfil />} />
                  <Route path="usuarios" element={<ConfiguracionUsuarios />} />
                  <Route path="productos" element={<Productos />} />
                  <Route path="servicios" element={<Servicios />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <SpeedInsights />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
