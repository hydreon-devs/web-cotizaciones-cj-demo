import { supabase } from "../conection";

export interface UserWithEmail {
    id: string;
    email: string;
    user_name: string;
    role: string;
}

export const getUsers = async () => {
    const { data, error } = await supabase.rpc("get_users_with_email");
    return { data: data as UserWithEmail[] | null, error };
};
