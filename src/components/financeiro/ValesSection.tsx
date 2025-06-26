import React from 'react';
import { Receipt, Plus } from 'lucide-react';

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
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vales Registrados</h2>
            <p className="text-gray-600 mt-1">Gerencie vales e adiantamentos dos profissionais</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Carregando vales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vales Registrados</h2>
            <p className="text-gray-600 mt-1">Gerencie vales e adiantamentos dos profissionais</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da seção com botão */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vales Registrados</h2>
          <p className="text-gray-600 mt-1">Gerencie vales e adiantamentos dos profissionais</p>
        </div>
        <button
          onClick={onNewVale}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-semibold">Registrar Vale</span>
        </button>
      </div>

      {/* Lista de vales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {vales.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum vale registrado</h3>
            <p className="text-gray-600 mb-6">Comece registrando o primeiro vale para seus profissionais.</p>
            <button
              onClick={onNewVale}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Registrar Primeiro Vale
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}