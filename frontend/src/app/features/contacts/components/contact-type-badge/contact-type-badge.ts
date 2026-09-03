import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ContactType, contactTypeLabels } from '../../../../core/models/contact.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact-type-badge',
  styleUrl: './contact-type-badge.scss',
  templateUrl: './contact-type-badge.html',
})
export class ContactTypeBadge {
  readonly type = input.required<ContactType>();
  protected readonly labels = contactTypeLabels;
}
