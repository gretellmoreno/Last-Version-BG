// Utilitários para formatação de telefone
export const formatPhone = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara baseada no tamanho
  if (limitedNumbers.length === 0) {
    return '';
  } else if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    // 11 dígitos - formato com 9
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
};

export const unformatPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const isValidPhone = (phone: string): boolean => {
  const numbers = unformatPhone(phone);
  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  return numbers.length === 10 || numbers.length === 11;
};

// Utilitário para formatação de CPF
export const formatCPF = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara baseada no tamanho
  if (limitedNumbers.length === 0) {
    return '';
  } else if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }
};

export const unformatCPF = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const isValidCPF = (cpf: string): boolean => {
  const numbers = unformatCPF(cpf);
  return numbers.length === 11;
};