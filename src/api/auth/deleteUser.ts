import { supabase } from "../conection";

export const deleteUser = async (userId: string) => {
    const { error } = await supabase.rpc("delete_user", { user_id: userId });
    return { error };
};
