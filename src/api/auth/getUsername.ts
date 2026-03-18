import { supabase } from "../conection";

export const getUsername = async () => {
    const { data, error } = await supabase.rpc("current_user");
    if (error) throw error;
    
    return data;
}