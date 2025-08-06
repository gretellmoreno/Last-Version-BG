import React, { useState, useEffect } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import User from 'lucide-react/dist/esm/icons/user';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Camera from 'lucide-react/dist/esm/icons/camera';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { formatPhone, isValidPhone, formatCPF } from '../utils/phoneUtils';
import { Professional } from '../types';
import DatePickerCalendar from './DatePickerCalendar';
import { useApp } from '../contexts/AppContext';
import { supabaseService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { PROFESSIONAL_COLORS } from '../utils/colorUtils';

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<void>;
  editingProfessional?: Professional | null;
  onDelete?: () => void;
  loading?: boolean;
  isMobile?: boolean;
}

interface ProfessionalFormData {
  name: string;
  role: string;
  phone: string;
  email: string;
  cpf: string;
  color: string;
  photo?: string; // base64 legacy, ignorar
  url_foto?: string | null;
  commission_rate: number;
}



export default function ProfessionalModal({
  isOpen,
  onClose,
  onSave,
  editingProfessional,
  onDelete,
  loading = false,
  isMobile = false
}: ProfessionalModalProps) {
  const [professionalForm, setProfessionalForm] = useState<ProfessionalFormData>({
    name: '',
    role: 'funcionario', // Valor padrão
    phone: '',
    email: '',
    cpf: '',
    color: PROFESSIONAL_COLORS[0],
    photo: '',
    url_foto: null,
    commission_rate: 50
  });

  // ESTADO INTERNO DE LOADING - APENAS PARA A FOTO
  const [photoUploading, setPhotoUploading] = useState(false);
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  // Detectar se é mobile (fallback se não vier via props)
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Usar props ou fallback interno
  const isMobileView = isMobile || isMobileDevice;

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingProfessional) {
      setProfessionalForm({
        name: editingProfessional.name || '',
        role: editingProfessional.role || '',
        phone: editingProfessional.phone || '',
        email: editingProfessional.email || '',
        cpf: (editingProfessional as any).cpf || '',
        color: editingProfessional.color || PROFESSIONAL_COLORS[0],
        photo: editingProfessional.photo || '',
        url_foto: editingProfessional.url_foto || editingProfessional.photo || '',
        commission_rate: editingProfessional.commission_rate || 50
      });
    } else {
      setProfessionalForm({
        name: '',
        role: 'funcionario', // Valor padrão
        phone: '',
        email: '',
        cpf: '',
        color: PROFESSIONAL_COLORS[0],
        photo: '',
        url_foto: null,
        commission_rate: 50
      });
    }
  }, [editingProfessional, isOpen]);

  const { currentSalon } = useApp();

  // Serviços do salão e seleção do profissional
  const [allServices, setAllServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Carregar serviços ao abrir modal
  useEffect(() => {
    if (!isOpen || !currentSalon?.id) return;
    setLoadingServices(true);
    (async () => {
      try {
        // Buscar todos os serviços do salão
        const { data: services, error: servicesError } = await supabaseService.services.list(currentSalon.id);
        if (servicesError) {
          console.error('Erro ao carregar serviços:', servicesError);
        }
        setAllServices(services || []);
        
        // Buscar serviços do profissional
        if (editingProfessional?.id) {
          console.log('Buscando serviços para profissional:', editingProfessional.id, 'salão:', currentSalon.id);
          const { data: profServices, error: profServicesError } = await supabase.rpc('list_services_for_professional', {
            p_salon_id: currentSalon.id,
            p_professional_id: editingProfessional.id
          });
          
          if (profServicesError) {
            console.error('Erro ao buscar serviços do profissional:', profServicesError);
          } else {
            console.log('Serviços encontrados para o profissional:', profServices);
            const serviceIds = (profServices || []).map((s: any) => s.id);
            console.log('IDs dos serviços selecionados:', serviceIds);
            setSelectedServiceIds(serviceIds);
          }
        } else {
          setSelectedServiceIds([]);
        }
      } catch (error) {
        console.error('Erro geral ao carregar serviços:', error);
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [isOpen, currentSalon?.id, editingProfessional?.id]);

  const handleUpdateForm = (field: keyof ProfessionalFormData, value: string | number | boolean) => {
    if (field === 'phone') {
      // Aplicar máscara no telefone
      const formattedPhone = formatPhone(value as string);
      setProfessionalForm(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else if (field === 'cpf') {
      // Aplicar máscara no CPF
      const formattedCPF = formatCPF(value as string);
      setProfessionalForm(prev => ({
        ...prev,
        [field]: formattedCPF
      }));
    } else {
      setProfessionalForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError || !uploadData?.path) {
        alert('Erro ao fazer upload da imagem.');
        setPhotoUploading(false);
        return;
      }
      // Obter URL pública correta usando o path retornado
      const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(uploadData.path);
      setProfessionalForm(prev => ({
        ...prev,
        url_foto: urlData.publicUrl
      }));
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = () => {
    setProfessionalForm(prev => ({
      ...prev,
      url_foto: null
    }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return professionalForm.name.trim() !== '' && 
           professionalForm.role.trim() !== '' &&
           professionalForm.phone.trim() !== '' && 
           isValidPhone(professionalForm.phone) &&
           professionalForm.email.trim() !== '' &&
           isValidEmail(professionalForm.email) &&
           professionalForm.commission_rate >= 0 &&
           professionalForm.commission_rate <= 100 &&
           selectedServiceIds.length > 0; // Adicionar validação para serviços
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    if (!isFormValid() || photoUploading || isInternalLoading) return;
    
    setIsInternalLoading(true);
    
    try {
      // Criar o objeto de dados
      const professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> & { url_foto?: string | null } = {
        name: professionalForm.name.trim(),
        role: professionalForm.role.trim(),
        phone: professionalForm.phone,
        email: professionalForm.email.trim(),
        color: professionalForm.color,
        commission_rate: professionalForm.commission_rate,
        active: true, // Valor padrão, não mais editável
        available_online: true,
        photo: undefined, // legacy, não usar
        url_foto: professionalForm.url_foto || null
      };

      // Chamar a função onSave que veio da página pai
      await onSave(professionalData);
      
      // Sincronizar serviços APENAS se estiver editando
      if (editingProfessional?.id && currentSalon?.id) {
        await supabase.rpc('upsert_professional_services', {
          p_salon_id: currentSalon.id,
          p_professional_id: editingProfessional.id,
          p_service_ids: selectedServiceIds
        });
      }

      // A lógica de sucesso foi movida para a página pai
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    } finally {
      setIsInternalLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={(loading || photoUploading || isInternalLoading) ? undefined : handleCancel} />
      
      {/* Modal - Layout responsivo */}
      <div className={`
        absolute bg-white shadow-xl flex flex-col overflow-hidden
        ${isMobileView 
          ? 'inset-x-4 bottom-0 top-16 rounded-t-3xl max-w-none' // Mobile: com margens laterais
          : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[580px] max-w-[calc(100vw-2rem)] max-h-[90vh] rounded-3xl' // Desktop: largura controlada
        }
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between ${isMobileView ? 'px-4 py-3' : 'px-4 py-2'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center">
              <User size={10} className="text-pink-600" />
            </div>
            <h2 className={`font-medium text-gray-900 ${isMobileView ? 'text-sm' : 'text-xs'}`}>
              {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            disabled={loading || photoUploading || isInternalLoading}
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className={`space-y-${isMobileView ? '4' : '3'}`}>
            {/* Avatar */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              {professionalForm.url_foto ? (
                <img
                  src={professionalForm.url_foto}
                  alt="Foto do profissional"
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
                  <User size={40} />
                </div>
              )}
              <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg cursor-pointer border border-gray-300 hover:bg-gray-50 transition-colors z-10">
                <Camera size={16} className="text-gray-600" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={loading || photoUploading}
                />
              </label>
              {professionalForm.url_foto && (
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-white rounded-full p-1.5 shadow-lg border border-gray-300 hover:bg-gray-50 transition-colors z-10"
                  onClick={removePhoto}
                  disabled={loading}
                  title="Remover foto"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              )}
            </div>



            {/* Formulário em coluna única */}
            <div className="space-y-3">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome completo"
                  value={professionalForm.name}
                  onChange={(e) => handleUpdateForm('name', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm`}
                />
              </div>

              {/* Função */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Função <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateForm('role', 'funcionario')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      professionalForm.role === 'funcionario'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        professionalForm.role === 'funcionario' ? 'bg-indigo-500' : 'bg-gray-300'
                      }`} />
                      Funcionário
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateForm('role', 'admin')}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      professionalForm.role === 'admin'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        professionalForm.role === 'admin' ? 'bg-purple-500' : 'bg-gray-300'
                      }`} />
                      Admin
                    </div>
                  </button>
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={professionalForm.phone}
                  onChange={(e) => handleUpdateForm('phone', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm ${
                    professionalForm.phone.trim() !== '' && !isValidPhone(professionalForm.phone)
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {professionalForm.phone.trim() !== '' && !isValidPhone(professionalForm.phone) && (
                  <p className="text-red-500 text-xs mt-1">
                    Telefone deve ter 10 ou 11 dígitos
                  </p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={professionalForm.email}
                  onChange={(e) => handleUpdateForm('email', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm ${
                    professionalForm.email.trim() !== '' && !isValidEmail(professionalForm.email)
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {professionalForm.email.trim() !== '' && !isValidEmail(professionalForm.email) && (
                  <p className="text-red-500 text-xs mt-1">
                    E-mail deve ter formato válido
                  </p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={professionalForm.cpf}
                  onChange={(e) => handleUpdateForm('cpf', e.target.value)}
                  className={`w-full px-3 ${isMobileView ? 'py-2.5' : 'py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm`}
                />
              </div>

              {/* Cor do Profissional */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Cor do Profissional
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PROFESSIONAL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleUpdateForm('color', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        professionalForm.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Cor ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Remover Taxa de Comissão e Status */}
              {/* Lista de Serviços */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Serviços que este profissional pode realizar <span className="text-red-500">*</span>
                </label>
                {loadingServices ? (
                  <div className="text-gray-500 text-sm">Carregando serviços...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allServices.map(service => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleServiceToggle(service.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedServiceIds.includes(service.id)
                            ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-300 shadow-sm'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <span className="flex-1 text-left">{service.name}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedServiceIds.includes(service.id)
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'bg-white border-gray-300'
                        }`}>
                          {selectedServiceIds.includes(service.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedServiceIds.length === 0 && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    É necessário selecionar pelo menos um serviço.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            {editingProfessional && onDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                disabled={loading}
              >
                <Trash2 size={14} />
                Deletar
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid() || loading || photoUploading || isInternalLoading}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center space-x-2 ${
              isFormValid() && !loading && !photoUploading && !isInternalLoading
                ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={
              !isFormValid() 
                ? selectedServiceIds.length === 0 
                  ? 'Selecione pelo menos um serviço'
                  : 'Preencha todos os campos obrigatórios'
                : ''
            }
          >
            {loading || photoUploading || isInternalLoading ? (
              <>
                <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                <span>
                  {isInternalLoading 
                    ? (editingProfessional ? 'Atualizando...' : 'Criando convite...')
                    : photoUploading 
                    ? 'Enviando foto...' 
                    : 'Salvando...'
                  }
                </span>
              </>
            ) : (
              <span>{editingProfessional ? 'Atualizar' : 'Criar Profissional'}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Modal de Sucesso */}
    </div>
  );
}