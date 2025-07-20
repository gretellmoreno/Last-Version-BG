import React, { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import { useFinanceiro } from '../../contexts/FinanceiroContext';

interface Vale {
  id: string;
  data: string;
  profissionalId: string;
  profissionalNome: string;
  valor: number;
  status: 'pendente' | 'descontado';
  observacoes?: string;
}

interface ValesSectionProps {
  onNewVale: () => void;
  onEditVale: (vale: Vale) => void;
  formatDate: (dateStr: string) => string;
}

export default function ValesSection({
  onNewVale,
  onEditVale,
  formatDate
}: ValesSectionProps) {
  const { vales, loading, error } = useFinanceiro();
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Carregando vales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
        <div className="mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar vales</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
          <p className="text-red-700 text-sm font-medium mb-2">Detalhes do erro:</p>
          <p className="text-red-600 text-sm break-words">{error}</p>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Lista de vales responsiva */}
      {vales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className={`text-center ${isMobile ? 'p-8' : 'p-12'}`}>
            <Receipt size={isMobile ? 40 : 48} className="mx-auto text-gray-400 mb-4" />
            <h3 className={`font-semibold text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              Nenhum vale registrado
            </h3>
            <p className={`text-gray-600 mb-6 ${isMobile ? 'text-sm' : ''}`}>
              Comece registrando o primeiro vale para seus profissionais.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isMobile ? (
            /* Cards compactos para mobile - padronizado */
            <div className="space-y-1.5 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
              {vales.map((vale) => (
                <div
                  key={vale.id}
                  onClick={() => onEditVale(vale)}
                  className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 pr-4">
                      <h3 className="font-medium text-gray-900 text-xs">{vale.profissionalNome}</h3>
                      </div>
                    </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <p className="font-semibold text-xs text-gray-900">
                        R$ {vale.valor.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-600">
                        {formatDate(vale.data)}
                      </p>
                      </div>
                    <div>
                      <p className={`font-semibold text-xs ${
                        vale.status === 'pendente' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {vale.status === 'pendente' ? 'Pendente' : 'Descontado'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Tabela para desktop */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profissional
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vales.map((vale) => (
                    <tr 
                      key={vale.id} 
                      onClick={() => onEditVale(vale)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-purple-600 font-semibold text-sm">
                              {vale.profissionalNome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {vale.profissionalNome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(vale.data)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          R$ {vale.valor.toFixed(2).replace('.', ',')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vale.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {vale.status === 'pendente' ? 'Pendente' : 'Descontado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}


    </div>
  );
}