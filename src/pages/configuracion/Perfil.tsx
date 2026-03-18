import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getProfile } from "@/api/auth/getProfile";
import { signIn } from "@/api/auth/singin";
import { updatePassword } from "@/api/auth/updatePassword";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

interface Profile {
    userName: string;
    email: string;
    role: string;
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Ingresá tu contraseña actual" }),
    newPassword: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres" })
      .refine((val) => /[A-Z]/.test(val), { message: "Debe contener al menos una mayúscula" })
      .refine((val) => /[0-9]/.test(val), { message: "Debe contener al menos un número" })
      .refine((val) => /[^a-zA-Z0-9]/.test(val), {
        message: "Debe contener al menos un carácter especial",
      }),
    confirmPassword: z.string().min(1, { message: "Confirmá tu nueva contraseña" }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export default function ConfiguracionPerfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userData = await getProfile();
        if (!isMounted) return;
        setProfile(userData);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "No se pudo cargar el perfil");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErrors({});

    const result = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setPwdErrors(fieldErrors);
      return;
    }

    if (!user?.email) {
      toast.error("No se pudo obtener tu email");
      return;
    }

    setIsChangingPwd(true);
    try {
      const { error: authError } = await signIn(user.email, currentPassword);
      if (authError) {
        setPwdErrors({ currentPassword: "Contraseña actual incorrecta" });
        return;
      }

      const { error: updateError } = await updatePassword(newPassword);
      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Gestiona tu información de usuario</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent>
            <div className="space-y-4">
              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={profile?.userName}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile?.email} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Rol</Label>
                <Input id="role" type="text" value={profile?.role} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              Guardar
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Actualizá tu contraseña de acceso</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  disabled={isChangingPwd}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.currentPassword && (
                <p className="text-xs text-destructive">{pwdErrors.currentPassword}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  disabled={isChangingPwd}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.newPassword && (
                <p className="text-xs text-destructive">{pwdErrors.newPassword}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  disabled={isChangingPwd}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwdErrors.confirmPassword && (
                <p className="text-xs text-destructive">{pwdErrors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isChangingPwd} className="w-full sm:w-auto">
              {isChangingPwd ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Cambiar contraseña"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
