import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, Zap, KeyRound, UserPlus } from "lucide-react";
import { DEMO_USER } from "@/demo/demoData";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    setHasError(true);
    setTimeout(() => setHasError(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("¡Bienvenido!");
        navigate("/");
      } else {
        toast.error("Credenciales incorrectas");
        triggerShake();
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="space-y-5 text-center pb-8">
          <div className="mx-auto animate-in zoom-in duration-500 delay-100">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-500 delay-300">
            <CardTitle className="text-2xl font-bold text-foreground">
              Gestor de Cotizaciones
            </CardTitle>
            <CardDescription className="text-sm font-semibold text-primary uppercase tracking-widest">
              Demo
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className={`space-y-4 ${hasError ? 'animate-shake' : ''}`}>
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500 delay-400">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-500 delay-500">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <Eye className="h-4 w-4 transition-transform duration-200" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-sm font-medium border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary transition-all duration-200 animate-in fade-in duration-500 delay-550"
              disabled={isLoading}
              onClick={() => {
                setEmail(DEMO_USER.email);
                setPassword(DEMO_USER.password);
              }}
            >
              <Zap className="mr-2 h-3.5 w-3.5" />
              Cargar credenciales demo
            </Button>

            <Button
              type="submit"
              className="w-full mt-2 h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="pt-2 border-t border-border/50 space-y-2 animate-in fade-in duration-500 delay-700">
            <p className="text-xs text-muted-foreground text-center mb-3">Otras opciones</p>
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/60 transition-colors group"
            >
              <KeyRound className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
              <div>
                <p className="text-sm font-medium text-foreground leading-none mb-1">Restablecer contraseña</p>
                <p className="text-xs text-muted-foreground">Ingresá una nueva contraseña si recibiste un link de recuperación por email.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/accept-invite")}
              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted/60 transition-colors group"
            >
              <UserPlus className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0 transition-colors" />
              <div>
                <p className="text-sm font-medium text-foreground leading-none mb-1">Activar cuenta</p>
                <p className="text-xs text-muted-foreground">Si fuiste invitado al sistema, completá tu nombre y contraseña para activar tu cuenta.</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
