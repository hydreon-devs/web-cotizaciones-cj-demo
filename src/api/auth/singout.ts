export const singout = async () => {
    localStorage.removeItem("demo_user");
    return { error: null };
};