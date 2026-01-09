import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole, getUserSubscription, UserRole, Subscription } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  subscription: Subscription | null;
  loading: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  subscription: null,
  loading: true,
  isAdmin: false,
  hasActiveSubscription: false,
  refreshSubscription: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [userRole, userSubscription] = await Promise.all([
      getUserRole(userId),
      getUserSubscription(userId),
    ]);
    setRole(userRole);
    setSubscription(userSubscription);
  };

  const refreshSubscription = async () => {
    if (user) {
      const sub = await getUserSubscription(user.id);
      setSubscription(sub);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching to avoid blocking
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setRole(null);
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    role,
    subscription,
    loading,
    isAdmin: role === 'admin',
    hasActiveSubscription: subscription?.status === 'active',
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
