import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import logoCJ from "@/assets/LogoCJ.png";
import logoCJNegro from "@/assets/LogoCJNegro.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/api/conection";
import { z } from "zod";
import type { Session } from "@supabase/supabase-js";

const acceptSchema = z
  .object({
    name: z.string().min(1, { message: "Ingresá tu nombre" }).max(100),
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres" })
      .refine((val) => /[A-Z]/.test(val), { message: "Debe contener al menos una mayúscula" })
      .refine((val) => /[0-9]/.test(val), { message: "Debe contener al menos un número" })
      .refine((val) => /[^a-zA-Z0-9]/.test(val), {
        message: "Debe contener al menos un carácter especial",
      }),
    confirmPassword: z.string().min(1, { message: "Confirmá tu contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const AcceptInvite = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    // Supabase procesa el token del hash automáticamente y dispara onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSession(s);
      }
      setIsLoadingSession(false);
    });

    // Por si la sesión ya fue procesada antes de que el listener se registre
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setIsLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = acceptSchema.safeParse({ name, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!session) {
      toast.error("Sesión inválida. Pedí una nueva invitación.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateAuthError } = await supabase.auth.updateUser({
        password,
        data: { full_name: name },
      });

      if (updateAuthError) {
        toast.error(updateAuthError.message);
        return;
      }

      await supabase.functions.invoke("acceot-invite", {
        body: { userName: name },
      });

      toast.success("¡Cuenta creada! Bienvenido al sistema.");
      navigate("/");
    } catch {
      toast.error("Error al configurar la cuenta");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20 text-center">
          <CardHeader className="space-y-4 pb-6">
            <div className="mx-auto">
              <img src={logoCJ} alt="CJ Producciones" className="h-24 dark:hidden" />
              <img src={logoCJNegro} alt="CJ Producciones" className="h-24 hidden dark:block" />
            </div>
            <CardTitle className="text-xl font-bold text-destructive">
              Enlace inválido o expirado
            </CardTitle>
            <CardDescription>
              Este enlace de invitación no es válido o ya fue utilizado. Contactá al administrador para recibir una nueva invitación.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl font-bold text-foreground">Crear cuenta</CardTitle>
            <CardDescription className="text-sm font-semibold text-primary uppercase tracking-widest">
              CJ Producciones
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500 delay-400">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Nombre completo
              </label>
              <Input
                type="text"
                placeholder="Ingresa tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="transition-all duration-200 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Email (solo lectura) */}
            <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-500 delay-450">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Correo electrónico
              </label>
              <Input
                type="email"
                value={session.user.email ?? ""}
                disabled
                className="bg-muted/50"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500 delay-500">
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
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-500 delay-550">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Confirmar contraseña
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-6 h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
