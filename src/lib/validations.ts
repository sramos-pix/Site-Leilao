/**
 * Valida o algoritmo do CPF
 */
export function validateCPF(cpf: string) {
  const cleanCPF = cpf.replace(/[^\d]+/g, '');
  
  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) {
    return false;
  }

  const digits = cleanCPF.split('').map(Number);
  
  const calculateDigit = (slice: number[]) => {
    const factor = slice.length + 1;
    const sum = slice.reduce((acc, curr, idx) => acc + curr * (factor - idx), 0);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  const digit1 = calculateDigit(digits.slice(0, 9));
  const digit2 = calculateDigit(digits.slice(0, 10));

  return digit1 === digits[9] && digit2 === digits[10];
}