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