// Utilitários para formatação de telefone
export const formatPhone = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const isValidPhone = (phone: string): boolean => {
  const numbers = unformatPhone(phone);
  return numbers.length >= 10 && numbers.length <= 11;
};