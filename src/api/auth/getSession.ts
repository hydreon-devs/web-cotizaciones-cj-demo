import { DEMO_USER } from "@/demo/demoData";

export const getSession = async () => {
    try {
        const stored = localStorage.getItem("demo_user");
        if (!stored) {
            return { data: { session: null }, error: null };
        }
        return {
            data: {
                session: {
                    access_token: "demo-token",
                    user: {
                        id: DEMO_USER.id,
                        email: DEMO_USER.email,
                        user_metadata: { name: DEMO_USER.name },
                    },
                },
            },
            error: null,
        };
    } catch {
        return { data: { session: null }, error: null };
    }
};