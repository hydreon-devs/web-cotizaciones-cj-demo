import { supabase } from "@/api/conection";
import { getRole } from "./getRole";
import { getUsername } from "./getUsername";

export const getProfile = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    const user = await getUsername();
    const role = await getRole();

    const rpcUser = user as unknown as Record<string, unknown> | null;

    const rpcName =
        (rpcUser && typeof rpcUser === "string" ? rpcUser : null) ??
        (rpcUser && typeof rpcUser === "string" ? rpcUser : null) ??
        (rpcUser && typeof rpcUser === "string" ? rpcUser : null) ??
        null;

    const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
    const metaName =
        (typeof meta.full_name === "string" ? meta.full_name : null) ??
        (typeof meta.name === "string" ? meta.name : null) ??
        null;

    const userData = {
        userName: rpcName ?? metaName,
        email: data.user.email,
        role: role.data,
    };
    
    return userData
};