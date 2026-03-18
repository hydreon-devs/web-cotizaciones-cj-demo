import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import logoCJ from "@/assets/LogoCJ.png";
import logoCJNegro from "@/assets/LogoCJNegro.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { resetPassword } from "@/api/auth/resetPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Ingresá tu correo");
      return;
    }
    setIsSendingReset(true);
    try {
      const { error } = await resetPassword(forgotEmail);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Te enviamos un email para restablecer tu contraseña");
      setShowForgot(false);
      setForgotEmail("");
    } catch {
      toast.error("Error al enviar el email");
    } finally {
      setIsSendingReset(false);
    }
  };

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
            <img src={logoCJ} alt="CJ Producciones" className="h-32 dark:hidden" />
            <img src={logoCJNegro} alt="CJ Producciones" className="h-32 hidden dark:block" />
          </div>
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-500 delay-300">
            <CardTitle className="text-2xl font-bold text-foreground">
              Gestor de Cotizaciones
            </CardTitle>
            <CardDescription className="text-sm font-semibold text-primary uppercase tracking-widest">
              CJ Producciones
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
              type="submit"
              className="w-full mt-6 h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-600"
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

          <div className="animate-in fade-in duration-500 delay-700">
            <button
              type="button"
              onClick={() => setShowForgot(!showForgot)}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center"
            >
              ¿Olvidaste tu contraseña?
            </button>

            {showForgot && (
              <form
                onSubmit={handleForgotPassword}
                className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Tu correo electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={isSendingReset}
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isSendingReset}
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar email de restablecimiento"
                  )}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
