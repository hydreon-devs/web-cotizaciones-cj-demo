import { supabase } from "../conection";

export interface Invitation {
    id: string;
    email: string;
    role: string;
    invited_at: string;
    expires_at: string;
    accepted_at: string | null;
}

export const getInvitations = async () => {
    const { data, error } = await supabase
        .from("user_invitations")
        .select("id, email, role, invited_at, expires_at, accepted_at")
        .order("invited_at", { ascending: false });
    return { data: data as Invitation[] | null, error };
};
