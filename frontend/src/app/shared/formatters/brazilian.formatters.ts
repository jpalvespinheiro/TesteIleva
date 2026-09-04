export function onlyDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function formatCpf(value: unknown): string {
  const cpf = onlyDigits(value).slice(0, 11);
  return cpf
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function formatPhone(value: unknown): string {
  let phone = onlyDigits(value);
  phone = phone.startsWith('55') && phone.length === 13 ? phone.slice(2) : phone;
  return phone
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCep(value: unknown): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/^(\d{5})(\d{3})$/, '$1-$2');
}
