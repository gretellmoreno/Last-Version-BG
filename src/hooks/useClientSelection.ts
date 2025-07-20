import { useState, useCallback } from 'react';
import { useClients } from './useClients';

interface ClientFormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  ano: string;
}

interface UseClientSelectionResult {
  // Estado
  showClientSelection: boolean;
  showClientForm: boolean;
  selectedClient: any | null;
  clientForm: ClientFormData;
  isCreatingClient: boolean;
  
  // Actions
  openClientSelection: () => void;
  closeClientSelection: () => void;
  openClientForm: () => void;
  closeClientForm: () => void;
  selectClient: (client: any) => void;
  selectNoClient: () => void;
  updateClientForm: (updates: Partial<ClientFormData>) => void;
  resetClientForm: () => void;
  saveNewClient: () => Promise<boolean>;
  resetSelection: () => void;
}

const initialClientForm: ClientFormData = {
  nome: '',
  sobrenome: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  ano: ''
};

export const useClientSelection = (): UseClientSelectionResult => {
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientForm, setClientForm] = useState<ClientFormData>(initialClientForm);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  
  const { addClient } = useClients();

  const openClientSelection = useCallback(() => {
    setShowClientSelection(true);
    setShowClientForm(false);
  }, []);

  const closeClientSelection = useCallback(() => {
    setShowClientSelection(false);
  }, []);

  const openClientForm = useCallback(() => {
    setShowClientForm(true);
    setShowClientSelection(false);
    setClientForm(initialClientForm);
  }, []);

  const closeClientForm = useCallback(() => {
    setShowClientForm(false);
    setClientForm(initialClientForm);
  }, []);

  const selectClient = useCallback((client: any) => {
    setSelectedClient(client);
    setShowClientSelection(false);
    setShowClientForm(false);
  }, []);

  const selectNoClient = useCallback(() => {
    setSelectedClient({
      id: null,
      nome: 'Sem reserva',
      name: 'Sem reserva'
    });
    setShowClientSelection(false);
    setShowClientForm(false);
  }, []);

  const updateClientForm = useCallback((updates: Partial<ClientFormData>) => {
    setClientForm(prev => ({ ...prev, ...updates }));
  }, []);

  const resetClientForm = useCallback(() => {
    setClientForm(initialClientForm);
  }, []);

  const saveNewClient = useCallback(async (): Promise<boolean> => {
    if (!clientForm.nome || !clientForm.telefone) {
      return false;
    }

    setIsCreatingClient(true);
    
    try {
      const success = await addClient({
        name: `${clientForm.nome} ${clientForm.sobrenome}`.trim(),
        phone: clientForm.telefone,
        email: clientForm.email,
        cpf: '',
        birth_date: clientForm.dataNascimento,
        salon_id: '', // Será preenchido pelo hook
        updated_at: new Date().toISOString()
      });

      if (success) {
        // Selecionar o cliente recém-criado
        const newClient = {
          id: 'temp_' + Date.now(), // ID temporário
          nome: `${clientForm.nome} ${clientForm.sobrenome}`.trim(),
          name: `${clientForm.nome} ${clientForm.sobrenome}`.trim(),
          telefone: clientForm.telefone,
          phone: clientForm.telefone,
          email: clientForm.email
        };
        
        setSelectedClient(newClient);
        setShowClientForm(false);
        setClientForm(initialClientForm);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return false;
    } finally {
      setIsCreatingClient(false);
    }
  }, [clientForm, addClient]);

  const resetSelection = useCallback(() => {
    setSelectedClient(null);
    setShowClientSelection(false);
    setShowClientForm(false);
    setClientForm(initialClientForm);
    setIsCreatingClient(false);
  }, []);

  return {
    // Estado
    showClientSelection,
    showClientForm,
    selectedClient,
    clientForm,
    isCreatingClient,
    
    // Actions
    openClientSelection,
    closeClientSelection,
    openClientForm,
    closeClientForm,
    selectClient,
    selectNoClient,
    updateClientForm,
    resetClientForm,
    saveNewClient,
    resetSelection
  };
}; 