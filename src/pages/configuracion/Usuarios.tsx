import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getUsers, type UserWithEmail } from "@/api/auth/getUsers";
import { getInvitations, type Invitation } from "@/api/auth/getInvitations";
import { inviteUser } from "@/api/auth/inviteuser";
import { deleteUser } from "@/api/auth/deleteUser";
import { roles } from "@/utils/const";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/api/conection";

function getInvitationStatus(inv: Invitation): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (inv.accepted_at) return { label: "Aceptada", variant: "default" };
  if (new Date(inv.expires_at) < new Date()) return { label: "Expirada", variant: "destructive" };
  return { label: "Pendiente", variant: "secondary" };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ConfiguracionUsuarios() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>(roles.EMPLEADO);
  const [isInviting, setIsInviting] = useState(false);

  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UserWithEmail | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [resendiendoId, setResendiendoId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoadingUsers(true);
      const { data, error } = await getUsers();
      if (error) toast.error("No se pudieron cargar los usuarios");
      else setUsers(data ?? []);
      setIsLoadingUsers(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoadingInvitations(true);
      const { data, error } = await getInvitations();
      if (error) toast.error("No se pudieron cargar las invitaciones");
      else setInvitations(data ?? []);
      setIsLoadingInvitations(false);
    })();
  }, []);

  const handleClickEliminar = (usuario: UserWithEmail) => {
    setUsuarioAEliminar(usuario);
    setDialogEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    try {
      const { error } = await deleteUser(usuarioAEliminar.id);
      if (error) {
        toast.error(error.message ?? "Error al eliminar el usuario");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== usuarioAEliminar.id));
      toast.success("Usuario eliminado correctamente");
      setDialogEliminarAbierto(false);
      setUsuarioAEliminar(null);
    } catch {
      toast.error("Error al eliminar el usuario");
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelarEliminar = () => {
    setDialogEliminarAbierto(false);
    setUsuarioAEliminar(null);
  };

  const handleResend = async (inv: Invitation) => {
    setResendiendoId(inv.id);
    try {
      const redirectTo = `${window.location.origin}/accept-invite`;
      const { error } = await supabase.functions.invoke("resend-invite", {
        body: { email: inv.email, redirectTo },
      });
      if (error) {
        toast.error("No se pudo reenviar la invitación");
        return;
      }
      toast.success(`Invitación reenviada a ${inv.email}`);
      const { data } = await getInvitations();
      setInvitations(data ?? []);
    } catch {
      toast.error("No se pudo reenviar la invitación");
    } finally {
      setResendiendoId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Ingresá un correo");
      return;
    }

    const yaInvitadoPendiente = invitations.some((inv) => {
      const isAccepted = !!inv.accepted_at;
      const isExpired = new Date(inv.expires_at) < new Date();
      return !isAccepted && !isExpired && inv.email.toLowerCase() === inviteEmail.toLowerCase();
    });
    if (yaInvitadoPendiente) {
      toast.error("Ya hay una invitación pendiente para este correo. Usá el botón de reenviar.");
      return;
    }

    setIsInviting(true);
    try {
      const { error } = await inviteUser(inviteEmail, inviteRole);
      if (error) {
        const msg = typeof error === "string" ? error : "";
        if (msg.includes("cuenta activa")) {
          toast.error("Este correo ya tiene una cuenta activa en el sistema");
        } else {
          toast.error("No se pudo enviar la invitación");
        }
        return;
      }
      toast.success("Invitación enviada");
      setInviteEmail("");
      setInviteRole(roles.EMPLEADO);

      const { data } = await getInvitations();
      setInvitations(data ?? []);
    } catch {
      toast.error("No se pudo enviar la invitación");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <>
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
        <CardDescription>Gestioná los usuarios y las invitaciones del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usuarios">
          <TabsList className="mb-6">
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="invitar">Invitar</TabsTrigger>
            <TabsTrigger value="invitaciones">Invitaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay usuarios registrados</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="w-14" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.user_name || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === roles.ADMIN ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {u.email !== currentUser?.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleClickEliminar(u)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="invitar">
            <form onSubmit={handleInvite} className="space-y-4 max-w-sm">
              <div className="flex flex-col gap-2">
                <Label htmlFor="inviteEmail">Correo electrónico</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="usuario@dominio.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="inviteRole">Rol</Label>
                <Select value={inviteRole} onValueChange={setInviteRole} disabled={isInviting}>
                  <SelectTrigger id="inviteRole">
                    <SelectValue placeholder="Seleccioná un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={roles.ADMIN}>Admin</SelectItem>
                    <SelectItem value={roles.EMPLEADO}>Empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isInviting} className="w-full sm:w-auto">
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar invitación"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="invitaciones">
            {isLoadingInvitations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay invitaciones enviadas</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Enviada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-14" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => {
                    const status = getInvitationStatus(inv);
                    const isResending = resendiendoId === inv.id;
                    return (
                      <TableRow key={inv.id}>
                        <TableCell>{inv.email}</TableCell>
                        <TableCell>
                          <Badge variant={inv.role === roles.ADMIN ? "default" : "secondary"}>
                            {inv.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(inv.invited_at)}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {!inv.accepted_at && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => handleResend(inv)}
                              disabled={isResending}
                              title="Reenviar invitación"
                            >
                              {isResending
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <RotateCcw className="h-3.5 w-3.5" />
                              }
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a{" "}
              <span className="font-semibold text-foreground">
                {usuarioAEliminar?.email}
              </span>
              ? Esta acción no se puede deshacer y el usuario perderá el acceso al sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelarEliminar} disabled={eliminando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarEliminar} disabled={eliminando}>
              {eliminando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
