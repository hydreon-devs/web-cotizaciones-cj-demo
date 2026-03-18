import { supabase } from "../conection";

export const singout = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};