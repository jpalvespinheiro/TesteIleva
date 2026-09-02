import { Pipe, PipeTransform } from '@angular/core';
import { formatCep } from '../formatters/brazilian.formatters';

@Pipe({
  name: 'cep',
})
export class CepPipe implements PipeTransform {
  transform(value: unknown): string {
    return formatCep(value);
  }
}
