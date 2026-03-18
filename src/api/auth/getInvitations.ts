export interface Invitation {
    id: string;
    email: string;
    role: string;
    invited_at: string;
    expires_at: string;
    accepted_at: string | null;
}

export const getInvitations = async () => {
    return { data: [] as Invitation[], error: null };
};
