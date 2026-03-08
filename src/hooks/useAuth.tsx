import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Step 1: Restore session from storage FIRST — this is the source of truth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      initialized.current = true;
    });

    // Step 2: Listen for subsequent auth changes (sign in, sign out, token refresh)
    // IMPORTANT: Do NOT set loading=true here — only update user/session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip INITIAL_SESSION if getSession hasn't resolved yet to avoid race condition
        if (event === "INITIAL_SESSION" && !initialized.current) {
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        // Only set loading false if not yet initialized (safety net)
        if (!initialized.current) {
          setLoading(false);
          initialized.current = true;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
