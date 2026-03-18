import { DEMO_USER } from "@/demo/demoData";

export const getProfile = async () => {
    return {
        userName: DEMO_USER.name,
        email: DEMO_USER.email,
        role: DEMO_USER.role,
    };
};