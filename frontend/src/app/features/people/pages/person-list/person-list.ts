import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, debounceTime, filter, finalize, fromEvent, merge } from 'rxjs';
import { apiErrorMessage } from '../../../../core/api-error';
import { PaginationMeta } from '../../../../core/models/api.model';
import { Person, PersonFilters } from '../../../../core/models/person.model';
import { PersonService } from '../../../../core/services/person';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';
import { formatCpf, formatPhone } from '../../../../shared/formatters/brazilian.formatters';
import { PersonDeleteDialog } from '../../components/person-delete-dialog/person-delete-dialog';
import { PersonGrid } from '../../components/person-grid/person-grid';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, LoadingState, PersonDeleteDialog, PersonGrid, ReactiveFormsModule, RouterLink],
  selector: 'app-person-list',
  styleUrl: './person-list.scss',
  templateUrl: './person-list.html',
})
export class PersonList {
  private readonly personService = inject(PersonService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageSize = 5;
  private loadSubscription?: Subscription;

  protected readonly filtersForm = this.formBuilder.nonNullable.group({
    name: '',
    cpf: '',
    phone: '',
  });
  protected readonly filtersOpen = signal(false);
  protected readonly appliedFilters = signal<PersonFilters>({ name: '', cpf: '', phone: '' });
  protected readonly people = signal<Person[]>([]);
  protected readonly pagination = signal<PaginationMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly personToDelete = signal<Person | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');
  protected readonly activeFilterCount = computed(() => {
    const filters = this.appliedFilters();

    return [filters.name, filters.cpf, filters.phone].filter(Boolean).length;
  });
  protected readonly visiblePages = computed(() => {
    const pagination = this.pagination();

    if (!pagination) {
      return [];
    }

    const pageCount = Math.min(5, pagination.last_page);
    const firstPage = Math.max(1, Math.min(pagination.page - 2, pagination.last_page - pageCount + 1));

    return Array.from({ length: pageCount }, (_, index) => firstPage + index);
  });

  constructor() {
    this.load(1);

    merge(
      fromEvent(window, 'focus'),
      fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible')),
    )
      .pipe(debounceTime(100), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(this.pagination()?.page ?? 1));
  }

  protected applyFilters(): void {
    const values = this.filtersForm.getRawValue();
    this.appliedFilters.set({ name: values.name.trim(), cpf: values.cpf, phone: values.phone });
    this.filtersOpen.set(false);
    this.load(1);
  }

  protected clearFilters(): void {
    this.filtersForm.reset({ name: '', cpf: '', phone: '' });
    this.appliedFilters.set({ name: '', cpf: '', phone: '' });
    this.load(1);
  }

  protected formatCpfFilter(): void {
    const control = this.filtersForm.controls.cpf;
    control.setValue(formatCpf(control.value));
  }

  protected formatPhoneFilter(): void {
    const control = this.filtersForm.controls.phone;
    control.setValue(formatPhone(control.value));
  }

  protected load(page: number): void {
    this.loadSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set('');

    this.loadSubscription = this.personService
      .list(this.appliedFilters(), page, this.pageSize)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.people.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (error: unknown) => this.error.set(apiErrorMessage(error)),
      });
  }

  protected requestDelete(person: Person): void {
    this.deleteError.set('');
    this.personToDelete.set(person);
  }

  protected cancelDelete(): void {
    this.personToDelete.set(null);
  }

  protected confirmDelete(): void {
    const person = this.personToDelete();

    if (!person || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');

    this.personService
      .delete(person.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.personToDelete.set(null);
          const currentPage = this.pagination()?.page ?? 1;
          this.load(this.people().length === 1 ? Math.max(1, currentPage - 1) : currentPage);
        },
        error: (error: unknown) => this.deleteError.set(apiErrorMessage(error)),
      });
  }
}
