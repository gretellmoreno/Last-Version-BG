import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../lib/supabaseService';
import { User, Session } from '@supabase/supabase-js';

interface UserContextData {
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
  salons: Array<{
    id: string;
    cnpj: string | null;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    currency: string;
    settings: any;
    timezone: string;
    subdomain: string | null;
    created_at: string;
    role: string;
  }>;
}

interface AuthContextData {
  user: User | null;
  session: Session | null;
  userContext: UserContextData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  currentUserRole: string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userContext, setUserContext] = useState<UserContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingContextRef = useRef(false);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log('🔍 Verificando sessão inicial...');
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('✅ Usuário encontrado na sessão, carregando contexto...');
          await loadUserContext();
        } else {
          console.log('❌ Nenhum usuário na sessão');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
        initialLoadRef.current = true;
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Carregar contexto apenas em situações específicas
        if (session?.user && shouldLoadContext(event)) {
          console.log('📥 Carregando contexto após mudança de auth...');
          await loadUserContext();
        } else if (!session?.user) {
          console.log('🚪 Usuário desconectado, limpando contexto...');
          setUserContext(null);
        }
        
        // Só definir loading como false após o carregamento inicial
        if (initialLoadRef.current) {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Determinar quando devemos carregar o contexto baseado no evento
  const shouldLoadContext = (event: string) => {
    // Carregar contexto apenas no INITIAL_SESSION (quando a página é carregada)
    // e no TOKEN_REFRESHED (quando o token é renovado)
    // Evitar carregar no SIGNED_IN para evitar timeout
    return event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED';
  };

  const loadUserContext = async () => {
    // Evitar múltiplas chamadas simultâneas
    if (loadingContextRef.current) {
      console.log('⚠️ Contexto já está sendo carregado, ignorando...');
      return;
    }

    loadingContextRef.current = true;

    try {
      console.log('🔄 Carregando contexto do usuário...');
      
      // Adicionar timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao carregar contexto')), 10000);
      });

      const contextPromise = supabaseService.utilities.getUserContext();
      
      const { data, error } = await Promise.race([contextPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ Erro ao carregar contexto do usuário:', error);
        return;
      }
      
      if (data) {
        console.log('✅ Contexto carregado com sucesso:', data);
        setUserContext(data);
      } else {
        console.log('⚠️ Nenhum dado retornado do contexto');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar contexto do usuário:', error);
    } finally {
      loadingContextRef.current = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      // O contexto será carregado automaticamente no onAuthStateChange
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro inesperado ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserContext(null);
    loadingContextRef.current = false;
    setLoading(false);
  };

  const isAuthenticated = !!user;
  
  // Calcular role e tipo de usuário
  const currentUserRole = userContext?.salons?.[0]?.role || null;
  const isAdmin = currentUserRole === 'admin';
  const isEmployee = currentUserRole === 'funcionario';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userContext,
      loading,
      signIn,
      signOut,
      isAuthenticated,
      isAdmin,
      isEmployee,
      currentUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
} 