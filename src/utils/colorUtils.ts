// Função para determinar se o texto deve ser preto ou branco baseado na cor de fundo
export const getTextColor = (backgroundColor: string) => {
  // Converter hex para RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcular luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retornar preto para cores claras, branco para cores escuras
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Paleta de cores pastéis para profissionais (18 cores variadas)
export const PROFESSIONAL_COLORS = [
  // Rosa suave
  '#FFE4E6', '#FECDD3',
  // Azul suave
  '#E0F2FE', '#BAE6FD',
  // Roxo suave
  '#F3E8FF', '#E9D5FF',
  // Verde suave
  '#F0FDF4', '#DCFCE7',
  // Amarelo suave
  '#FEFCE8', '#FEF9C3',
  // Laranja suave
  '#FFF7ED', '#FFEDD5',
  // Turquesa suave
  '#CCFBF1', '#99F6E4',
  // Coral suave
  '#FFF1F2', '#FFE4E6',
  // Bege suave
  '#FDF6E3', '#F7E9C7'
];

// Cor padrão para profissionais
export const DEFAULT_PROFESSIONAL_COLOR = '#FFE4E6'; 