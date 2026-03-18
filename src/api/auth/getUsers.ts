import { DEMO_USERS } from "@/demo/demoData";

export interface UserWithEmail {
    id: string;
    email: string;
    user_name: string;
    role: string;
}

export const getUsers = async () => {
    return { data: DEMO_USERS as UserWithEmail[], error: null };
};
