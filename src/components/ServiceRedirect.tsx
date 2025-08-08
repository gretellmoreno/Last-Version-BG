import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface ServiceRedirectProps {
  children: React.ReactNode;
}

export default function ServiceRedirect({ children }: ServiceRedirectProps) {
  const { hasServices, isReady, currentSalon, initialLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Só verificar redirecionamento quando o app estiver pronto,
    // tivermos dados do salão e o carregamento inicial terminou
    if (!initialLoading && isReady && currentSalon && !hasServices) {
      navigate('/servicos', { replace: true });
    }
  }, [hasServices, isReady, currentSalon, initialLoading, navigate]);

  return <>{children}</>;
} 