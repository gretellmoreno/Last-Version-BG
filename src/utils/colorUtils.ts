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

// Paleta de cores pastéis para profissionais (tons mais lindos)
export const PROFESSIONAL_COLORS = [
  // Rosa pastel (tons mais claros)
  '#FFE4E6', '#FECDD3',
  // Azul pastel (tons mais claros)
  '#E0F2FE', '#BAE6FD',
  // Roxo pastel (tons mais claros)
  '#F3E8FF', '#E9D5FF',
  // Amarelo pastel (tons mais claros)
  '#FEFCE8', '#FEF9C3',
  // Laranja pastel (tons mais claros)
  '#FFF7ED', '#FFEDD5',
  // Turquesa pastel (tons mais claros)
  '#CCFBF1', '#99F6E4',
  // Coral pastel (tons mais claros)
  '#FFF1F2', '#FFE4E6',
  // Lavanda pastel (tons mais claros)
  '#F5F3FF', '#EDE9FE',
  // Pêssego pastel (tons mais claros)
  '#FFF5F5', '#FED7D7'
];

// Cor padrão para profissionais
export const DEFAULT_PROFESSIONAL_COLOR = '#FFE4E6'; 