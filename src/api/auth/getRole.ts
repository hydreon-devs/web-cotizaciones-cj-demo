import { supabase } from "../conection";

export const getRole = async () => {
    const { data, error } = await supabase.rpc("current_user_role");
    return { data, error };
};