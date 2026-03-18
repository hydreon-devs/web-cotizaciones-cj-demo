import { DEMO_USER } from "@/demo/demoData";

export const signIn = async (email: string, password: string) => {
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
        return {
            data: {
                session: { access_token: "demo-token" },
                user: {
                    id: DEMO_USER.id,
                    email: DEMO_USER.email,
                    user_metadata: { name: DEMO_USER.name },
                },
            },
            error: null,
        };
    }
    return { data: { session: null, user: null }, error: new Error("Credenciales incorrectas") };
};