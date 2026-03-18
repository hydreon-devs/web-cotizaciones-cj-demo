import { supabase } from "../conection";

export const resetPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });
    return { data, error };
};
