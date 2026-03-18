import { supabase } from "../conection";

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
};