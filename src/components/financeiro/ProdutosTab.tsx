import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendaProduto {
  sale_date: string;
  product_name: string;
  sale_source: string;
  client_name: string;
  payment_method_name: string;
  quantity: number;
  total_value: number;
  profit: number;
}

interface ProdutosTabProps {
  vendas: VendaProduto[];
  isLoading: boolean;
}

export default function ProdutosTab({ vendas, isLoading }: ProdutosTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      {/* Card de Resumo do Período - Mobile primeiro */}
      {vendas.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Resumo do Período</h3>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Total de Vendas */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:shadow-md hover:scale-[1.02] hover:bg-blue-50/50 hover:border-blue-200 transition-all duration-300 cursor-pointer">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Total de Vendas</p>
              <p className="text-lg font-bold text-blue-900">{vendas.length}</p>
            </div>

            {/* Valor Total */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:shadow-md hover:scale-[1.02] hover:bg-green-50/50 hover:border-green-200 transition-all duration-300 cursor-pointer">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Valor Total</p>
              <p className="text-sm md:text-lg font-bold text-green-900">
                R$ {vendas.reduce((sum, venda) => sum + venda.total_value, 0).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Lucro Total */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:shadow-md hover:scale-[1.02] hover:bg-indigo-50/50 hover:border-indigo-200 transition-all duration-300 cursor-pointer">
              <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1">Lucro Total</p>
              <p className="text-sm md:text-lg font-bold text-indigo-900">
                R$ {vendas.reduce((sum, venda) => sum + venda.profit, 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Título com contador */}
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Histórico de Vendas ({vendas.length})
        </h2>
      </div>

      {/* Tabela */}
      {vendas.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center text-gray-500">
          Nenhuma venda de produto encontrada no período selecionado.
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop View */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data da Venda
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidades
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lucro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendas.map((venda, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(venda.sale_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venda.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venda.client_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venda.payment_method_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {venda.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                      R$ {venda.total_value.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                      R$ {venda.profit.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-200">
              {vendas.map((venda, index) => (
                <div key={index} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{venda.product_name}</p>
                      <p className="text-sm text-gray-500">{venda.client_name || 'Cliente não informado'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatDateTime(venda.sale_date)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Pagamento</p>
                      <p className="font-medium">{venda.payment_method_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Unidades</p>
                      <p className="font-medium">{venda.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor Total</p>
                      <p className="font-medium text-green-600">R$ {venda.total_value.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Lucro</p>
                      <p className="font-medium text-blue-600">R$ {venda.profit.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 