import React, { useState, useEffect } from 'react';
import { Receipt, Plus, User, Edit3, Trash2 } from 'lucide-react';

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
  onDeleteVale: (vale: Vale) => void;
  formatDate: (dateStr: string) => string;
}

export default function ValesSection({
  vales,
  loading = false,
  error = null,
  onNewVale,
  onEditVale,
  onDeleteVale,
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
            /* Cards Mobile Estéticos */
            <div className="grid grid-cols-1 gap-3">
              {vales.map((vale) => (
                <div 
                  key={vale.id} 
                  className="group relative bg-white rounded-xl border border-gray-200 p-2 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Ponto roxo no canto superior direito */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full"></div>
                  
                  <div className="space-y-1.5">
                    {/* Header com profissional */}
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User size={12} className="text-indigo-600" />
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

                    {/* Botões invisíveis que aparecem no hover */}
                    <div className="flex justify-end space-x-1 pt-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button 
                        onClick={() => onEditVale(vale)}
                        className="flex items-center space-x-1 px-2 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs"
                      >
                        <Edit3 size={12} />
                        <span className="font-medium">Editar</span>
                      </button>
                      <button 
                        onClick={() => onDeleteVale(vale)}
                        className="flex items-center space-x-1 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs"
                      >
                        <Trash2 size={12} />
                        <span className="font-medium">Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Tabela Desktop */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Profissional
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vales.map((vale) => (
                      <tr key={vale.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(vale.data)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-600 font-medium text-xs">
                                {vale.profissionalNome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {vale.profissionalNome}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            R$ {vale.valor.toFixed(2).replace('.', ',')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                            ${vale.status === 'descontado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            }
                          `}>
                            {vale.status === 'descontado' ? 'Descontado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => onEditVale(vale)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => onDeleteVale(vale)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}