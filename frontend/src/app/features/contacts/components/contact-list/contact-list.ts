import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Contact } from '../../../../core/models/contact.model';
import { formatPhone } from '../../../../shared/formatters/brazilian.formatters';
import { ContactTypeBadge } from '../contact-type-badge/contact-type-badge';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContactTypeBadge],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  readonly contacts = input.required<readonly Contact[]>();
  readonly editRequested = output<Contact>();
  readonly deleteRequested = output<Contact>();

  protected displayValue(contact: Contact): string {
    return contact.type === 'email' ? contact.value : formatPhone(contact.value);
  }
}
