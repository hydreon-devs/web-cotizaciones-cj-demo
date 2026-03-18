import { supabase } from "../conection";

export const inviteUser = async (email: string, role: string) => {
    const redirectTo = `${window.location.origin}/accept-invite`;
    const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email, role, redirectTo },
    });

    if (error) {
        try {
            const body = await (error as { context?: Response }).context?.json();
            return { data: null, error: body?.error ?? error.message ?? "Error desconocido", status: (error as { context?: Response }).context?.status };
        } catch {
            return { data: null, error: error.message ?? "Error desconocido", status: undefined };
        }
    }

    return { data, error: null, status: 200 };
};