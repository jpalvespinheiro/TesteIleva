export function onlyDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function formatCpf(value: unknown): string {
  const cpf = onlyDigits(value).slice(0, 11);
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function formatPhone(value: unknown): string {
  let phone = onlyDigits(value);
  phone = phone.startsWith('55') && phone.length === 13 ? phone.slice(2) : phone;
  return phone.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, '($1) $2$3-$4');
}

export function formatCep(value: unknown): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/^(\d{5})(\d{3})$/, '$1-$2');
}
