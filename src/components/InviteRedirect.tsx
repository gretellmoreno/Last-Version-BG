import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InviteRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash) {
      console.log('🔗 InviteRedirect - Hash detectado:', hash);
      
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const type = params.get('type');
      
      console.log('📋 Parâmetros:', { type, hasAccessToken: !!accessToken });
      
      // Se é um convite, redirecionar para definir senha
      if (accessToken && type === 'invite') {
        console.log('✅ Redirecionando para /definir-senha com tokens');
        navigate(`/definir-senha${hash}`, { replace: true });
        return;
      }
    }
    
    // Se não é convite, redirecionar para agenda
    console.log('📍 Não é convite, redirecionando para /agenda');
    navigate('/agenda', { replace: true });
  }, [navigate]);

  // Mostrar loading enquanto processa
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando...</p>
      </div>
    </div>
  );
} 