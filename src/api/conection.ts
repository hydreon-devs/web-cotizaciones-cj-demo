/**
 * Demo mode: Supabase stub.
 * No real connection is made. All methods resolve with empty/demo data.
 */

import { DEMO_USER } from "@/demo/demoData";

const demoSession = () => {
  const stored = localStorage.getItem("demo_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const supabase = {
  auth: {
    onAuthStateChange: (_event: unknown, _callback: unknown) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
    getUser: async () => {
      const session = demoSession();
      if (!session) {
        return { data: { user: null }, error: new Error("Not authenticated") };
      }
      return {
        data: {
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            user_metadata: { name: DEMO_USER.name },
          },
        },
        error: null,
      };
    },
    signInWithPassword: async (_credentials: { email: string; password: string }) => {
      return { data: { session: null, user: null }, error: null };
    },
    signOut: async () => {
      return { error: null };
    },
  },
  from: (_table: string) => ({
    select: (_query?: string) => ({
      eq: (_col: string, _val: unknown) => ({
        single: async () => ({ data: null, error: null }),
        order: (_col2: string, _opts?: unknown) => ({ data: [], error: null }),
        not: (_col2: string, _op: string, _val2: unknown) => ({ data: [], error: null }),
      }),
      order: (_col: string, _opts?: unknown) => ({
        data: [],
        error: null,
        eq: (_c: string, _v: unknown) => ({ data: [], error: null }),
      }),
      not: (_col: string, _op: string, _val: unknown) => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null }),
      in: (_col: string, _vals: unknown[]) => ({ data: [], error: null }),
    }),
    insert: (_data: unknown) => ({
      select: (_q?: string) => ({
        single: async () => ({ data: null, error: null }),
      }),
      error: null,
    }),
    update: (_data: unknown) => ({
      eq: (_col: string, _val: unknown) => ({
        select: (_q?: string) => ({
          single: async () => ({ data: null, error: null }),
        }),
        error: null,
      }),
    }),
    delete: () => ({
      eq: (_col: string, _val: unknown) => ({ error: null }),
      in: (_col: string, _vals: unknown[]) => ({ error: null }),
    }),
    upsert: (_data: unknown) => ({ error: null }),
  }),
  rpc: async (_fn: string, _params?: unknown) => ({
    data: null,
    error: null,
  }),
  functions: {
    invoke: async (_fn: string, _opts?: unknown) => ({ data: null, error: null }),
  },
} as const;
