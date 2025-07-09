import React, { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';

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
  vales: Vale[];
  loading?: boolean;
  error?: string | null;
  onNewVale: () => void;
  onEditVale: (vale: Vale) => void;
  formatDate: (dateStr: string) => string;
}

export default function ValesSection({
  vales,
  loading = false,
  error = null,
  onNewVale,
  onEditVale,
  formatDate
}: ValesSectionProps) {
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-red-500">Erro: {error}</p>
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
            /* Cards para mobile */
            <div className="space-y-2 h-[calc(100vh-150px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
              {vales.map((vale) => (
                <div
                  key={vale.id}
                  onClick={() => onEditVale(vale)}
                  className="group relative bg-white rounded-xl border border-gray-200 p-3 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                >
                  {/* Ponto roxo decorativo */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full"></div>
                  
                  <div className="space-y-2">
                    {/* Header com profissional e data */}
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-xs">
                          {vale.profissionalNome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">{vale.profissionalNome}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{formatDate(vale.data)}</p>
                      </div>
                    </div>

                    {/* Valor e Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Valor</p>
                        <p className="font-bold text-lg text-gray-900">
                          R$ {vale.valor.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
                        <span className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                          ${vale.status === 'descontado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        `}>
                          {vale.status === 'descontado' ? 'Descontado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Tabela para desktop - como profissionais */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Profissional
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                          vale.status === 'descontado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vale.status === 'descontado' ? 'Descontado' : 'Pendente'}
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