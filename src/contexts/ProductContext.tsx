import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from './AppContext';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<boolean>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<boolean>;
  removeProduct: (productId: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
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
  const { currentSalon, isReady } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    if (!currentSalon) return;
    setLoading(true);
    setError(null);
    
    const result = await supabaseService.products.list(currentSalon.id);
    
    if (result.error) {
      setError(result.error);
    } else {
      setProducts(result.data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (isReady && currentSalon) {
      refreshProducts();
    }
  }, [isReady, currentSalon?.id]);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    if (!currentSalon) return false;
    
    const result = await supabaseService.products.create({
      salonId: currentSalon.id,
      name: product.name,
      price: product.price,
      costPrice: product.cost_price,
      profitMargin: product.profit_margin,
      stock: product.stock,
      description: product.description
    });

    if (result.error) {
      setError(result.error);
      return false;
    }

    if (result.data?.success && result.data.product) {
      // Adicionar o produto recém-criado diretamente à lista
      setProducts(prev => [result.data.product, ...prev]);
      return true;
    }

    return false;
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    if (!currentSalon) return false;
    
    const result = await supabaseService.products.update({
      productId,
      salonId: currentSalon.id,
      name: updates.name || '',
      price: updates.price || 0,
      costPrice: updates.cost_price || 0,
      profitMargin: updates.profit_margin || 0,
      stock: updates.stock || 0,
      description: updates.description
    });

    if (result.error) {
      setError(result.error);
      return false;
    }

    await refreshProducts();
    return true;
  };

  const removeProduct = async (productId: string) => {
    if (!currentSalon) return false;
    
    const result = await supabaseService.products.delete(productId, currentSalon.id);

    if (result.error) {
      setError(result.error);
      return false;
    }

    await refreshProducts();
    return true;
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      addProduct,
      updateProduct,
      removeProduct,
      refreshProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};