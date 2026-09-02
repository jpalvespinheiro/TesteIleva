import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api-error';
import { Contact } from '../../../../core/models/contact.model';
import { Person } from '../../../../core/models/person.model';
import { ContactService } from '../../../../core/services/contact';
import { PersonService } from '../../../../core/services/person';
import { ContactForm } from '../../../contacts/components/contact-form/contact-form';
import { ContactDeleteDialog } from '../../../contacts/components/contact-delete-dialog/contact-delete-dialog';
import { ContactList } from '../../../contacts/components/contact-list/contact-list';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { CepPipe } from '../../../../shared/pipes/cep-pipe';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { PhonePipe } from '../../../../shared/pipes/phone-pipe';
import { PersonDeleteDialog } from '../../components/person-delete-dialog/person-delete-dialog';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CepPipe,
    ContactDeleteDialog,
    ContactForm,
    ContactList,
    CpfPipe,
    EmptyState,
    LoadingState,
    PersonDeleteDialog,
    PhonePipe,
    RouterLink,
  ],
  selector: 'app-person-details',
  styleUrl: './person-details.scss',
  templateUrl: './person-details.html',
})
export class PersonDetails {
  private readonly personService = inject(PersonService);
  private readonly contactService = inject(ContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly personId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly person = signal<Person | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly contactFormOpen = signal(false);
  protected readonly editingContact = signal<Contact | null>(null);
  protected readonly contactToDelete = signal<Contact | null>(null);
  protected readonly deletingContact = signal(false);
  protected readonly deletePersonDialogOpen = signal(false);
  protected readonly deletingPerson = signal(false);
  protected readonly actionError = signal('');

  constructor() {
    if (this.personId) {
      this.loadPerson();
    } else {
      void this.router.navigate(['/people']);
    }
  }

  protected openNewContact(): void {
    this.editingContact.set(null);
    this.contactFormOpen.set(true);
  }

  protected openEditContact(contact: Contact): void {
    this.editingContact.set(contact);
    this.contactFormOpen.set(true);
  }

  protected closeContactForm(): void {
    this.contactFormOpen.set(false);
    this.editingContact.set(null);
  }

  protected contactSaved(): void {
    this.closeContactForm();
    this.loadPerson(false);
  }

  protected requestContactDelete(contact: Contact): void {
    this.actionError.set('');
    this.contactToDelete.set(contact);
  }

  protected confirmContactDelete(): void {
    const contact = this.contactToDelete();

    if (!contact || this.deletingContact()) {
      return;
    }

    this.deletingContact.set(true);
    this.contactService
      .delete(contact.id)
      .pipe(finalize(() => this.deletingContact.set(false)))
      .subscribe({
        next: () => {
          this.contactToDelete.set(null);
          this.loadPerson(false);
        },
        error: (error: unknown) => this.actionError.set(apiErrorMessage(error)),
      });
  }

  protected confirmPersonDelete(): void {
    if (this.deletingPerson()) {
      return;
    }

    this.deletingPerson.set(true);
    this.personService
      .delete(this.personId)
      .pipe(finalize(() => this.deletingPerson.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/people']),
        error: (error: unknown) => {
          this.actionError.set(apiErrorMessage(error));
          this.deletePersonDialogOpen.set(false);
        },
      });
  }

  protected loadPerson(showLoading = true): void {
    if (showLoading) {
      this.loading.set(true);
    }

    this.error.set('');
    this.personService
      .get(this.personId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ data }) => this.person.set(data),
        error: (error: unknown) => this.error.set(apiErrorMessage(error)),
      });
  }
}
