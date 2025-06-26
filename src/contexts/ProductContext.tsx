import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Produto } from '../types';

interface ProductContextType {
  produtos: Produto[];
  addProduto: (produto: Produto) => void;
  updateProduto: (id: string, updates: Partial<Produto>) => void;
  removeProduto: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const addProduto = (produto: Produto) => {
    setProdutos(prev => [...prev, produto]);
  };

  const updateProduto = (id: string, updates: Partial<Produto>) => {
    setProdutos(prev => 
      prev.map(produto => 
        produto.id === id ? { ...produto, ...updates } : produto
      )
    );
  };

  const removeProduto = (id: string) => {
    setProdutos(prev => prev.filter(produto => produto.id !== id));
  };

  return (
    <ProductContext.Provider value={{
      produtos,
      addProduto,
      updateProduto,
      removeProduto
    }}>
      {children}
    </ProductContext.Provider>
  );
};