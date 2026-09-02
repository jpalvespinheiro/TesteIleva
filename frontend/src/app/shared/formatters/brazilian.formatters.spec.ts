import { formatCep, formatCpf, formatPhone } from './brazilian.formatters';

describe('Brazilian formatters', () => {
  it('formats a CPF', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });

  it('formats a mobile phone with country code', () => {
    expect(formatPhone('5511999998888')).toBe('(11) 99999-8888');
  });

  it('formats a CEP', () => {
    expect(formatCep('01001000')).toBe('01001-000');
  });
});
