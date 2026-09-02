import { Pipe, PipeTransform } from '@angular/core';
import { formatPhone } from '../formatters/brazilian.formatters';

@Pipe({
  name: 'phone',
})
export class PhonePipe implements PipeTransform {
  transform(value: unknown): string {
    return formatPhone(value);
  }
}
