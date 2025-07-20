// Utilitários para manipulação de datas sem problemas de fuso horário

/**
 * Converte uma data para string no formato YYYY-MM-DD garantindo que seja no fuso horário local
 * @param date - Data a ser convertida
 * @returns String no formato YYYY-MM-DD
 */
export const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtém a data atual no formato YYYY-MM-DD no fuso horário local
 * @returns String da data atual no formato YYYY-MM-DD
 */
export const getTodayLocal = (): string => {
  return formatDateToLocal(new Date());
};

/**
 * Cria uma data específica evitando problemas de fuso horário
 * @param dateInput - String no formato YYYY-MM-DD ou objeto Date
 * @returns Date object no fuso horário local
 */
export const createLocalDate = (dateInput: string | Date): Date => {
  if (typeof dateInput === 'string') {
    const [year, month, day] = dateInput.split('-').map(Number);
    return new Date(year, month - 1, day);
  } else if (dateInput instanceof Date) {
    return dateInput;
  } else {
    console.warn('⚠️ createLocalDate recebeu tipo inesperado:', typeof dateInput, dateInput);
    return new Date(); // fallback
  }
};

/**
 * Formata uma data para exibição em português brasileiro
 * @param dateInput - String no formato YYYY-MM-DD ou objeto Date
 * @returns String formatada para exibição (DD/MM/AAAA)
 */
export const formatDateForDisplay = (dateInput: string | Date): string => {
  const date = createLocalDate(dateInput);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Calcula uma data relativa a partir de hoje
 * @param days - Número de dias para adicionar (positivo) ou subtrair (negativo)
 * @returns String no formato YYYY-MM-DD
 */
export const getRelativeDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateToLocal(date);
};

/**
 * Obtém o primeiro dia da semana atual (domingo)
 * @returns String no formato YYYY-MM-DD
 */
export const getStartOfWeek = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day;
  date.setDate(diff);
  return formatDateToLocal(date);
};

/**
 * Obtém o último dia da semana atual (sábado)
 * @returns String no formato YYYY-MM-DD
 */
export const getEndOfWeek = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + 6;
  date.setDate(diff);
  return formatDateToLocal(date);
};

/**
 * Obtém o primeiro dia do mês atual
 * @returns String no formato YYYY-MM-DD
 */
export const getStartOfMonth = (): string => {
  const date = new Date();
  date.setDate(1);
  return formatDateToLocal(date);
};

/**
 * Obtém o último dia do mês atual
 * @returns String no formato YYYY-MM-DD
 */
export const getEndOfMonth = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  return formatDateToLocal(date);
}; 