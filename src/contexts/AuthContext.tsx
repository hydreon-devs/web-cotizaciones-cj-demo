import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signIn } from "../api/auth/singin";
import { getSession } from "../api/auth/getSession";
import { singout } from "../api/auth/singout";
import { getRole } from "../api/auth/getRole";
import { supabase } from "../api/conection";
interface User {
  token: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales de prueba
const TEST_CREDENTIALS = {
  email: "admin@cotizaciones.cl",
  password: "admin123",
  name: "Admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => {
        setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  };

  const fetchRole = async (): Promise<string> => {
    try {
      const { data, error } = await withTimeout(getRole(), 3000, { data: "", error: null });
      if (error) return "";
      if (typeof data === "string") return data;
      return "";
    } catch {
      return "";
    }
  };

  const logout = async () => {
    setUser(null);
    await withTimeout(singout(), 3000, { error: null });
  };

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { data, error } = await getSession();

      if (error) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        const sessionUser = data.session.user;
        const role = await fetchRole();
        const userData = {
          token: data.session.access_token,
          email: sessionUser.email ?? "",
          name: sessionUser.user_metadata?.name ?? "",
          role,
        };

        setUser(userData);
        setIsLoading(false);
        return;
      }

      setUser(null);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }

      if (!session) return;

      if (event === "TOKEN_REFRESHED") {
        setUser((prev) => {
          if (!prev) return prev;
          return { ...prev, token: session.access_token };
        });
        return;
      }

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        const sessionUser = session.user;
        const fetchedRole = await fetchRole();

        setUser((prev) => {
          const role = fetchedRole || prev?.role || "";
          return {
            token: session.access_token,
            email: sessionUser.email ?? "",
            name: sessionUser.user_metadata?.name ?? "",
            role,
          };
        });
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de API
    // await new Promise((resolve) => setTimeout(resolve, 800));

    const { data, error } = await signIn(email, password);

    if (error) return false;
    
    console.log(data);

    const role = await fetchRole();
    const userData = {
      token: data.session?.access_token ?? "",
      email: data.user?.email ?? "",
      name: data.user?.user_metadata?.name ?? "",
      role,
    };

    setUser(userData);
    return true;

  //   if (
  //     email === TEST_CREDENTIALS.email &&
  //     password === TEST_CREDENTIALS.password
  //   ) {
  //     const userData = {
  //       email: TEST_CREDENTIALS.email,
  //       name: TEST_CREDENTIALS.name,
  //     };
  //     setUser(userData);
  //     localStorage.setItem("user", JSON.stringify(userData));
  //     return true;
  //   }

  //   return false;
  // };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
