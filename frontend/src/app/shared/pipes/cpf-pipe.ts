import { Pipe, PipeTransform } from '@angular/core';
import { formatCpf } from '../formatters/brazilian.formatters';

@Pipe({
  name: 'cpf',
})
export class CpfPipe implements PipeTransform {
  transform(value: unknown): string {
    return formatCpf(value);
  }
}
