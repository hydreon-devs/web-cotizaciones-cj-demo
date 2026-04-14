import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AcceptInvite = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="space-y-5 text-center pb-6">
          <div className="mx-auto animate-in zoom-in duration-500 delay-100">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-500 delay-300">
            <CardTitle className="text-2xl font-bold text-foreground">Activar cuenta</CardTitle>
            <CardDescription className="text-sm font-semibold text-primary uppercase tracking-widest">
              Gestor de Cotizaciones
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Para activar tu cuenta necesitás un enlace de invitación enviado por el administrador del sistema.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground leading-none mb-1">Revisá tu correo</p>
                <p className="text-xs text-muted-foreground">El administrador te envía un email con un enlace único de activación. Hacé click en ese enlace para llegar a esta página con tu sesión ya validada.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-muted/50">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground leading-none mb-1">Solo una vez</p>
                <p className="text-xs text-muted-foreground">Cada enlace de invitación es de uso único y expira a las 24 horas de ser enviado.</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
