import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { afterEach, vi } from 'vitest';
import { PaginatedResponse } from '../../../../core/models/api.model';
import { Person, PersonFilters } from '../../../../core/models/person.model';
import { PersonService } from '../../../../core/services/person';
import { PersonList } from './person-list';

const emptyPage: PaginatedResponse<Person> = {
  data: [],
  pagination: { page: 1, last_page: 1, per_page: 10, total: 0 },
};

const person: Person = {
  id: 1,
  name: 'Ana Souza',
  cpf: '52998224725',
  phone: '5511999991111',
  address: {
    cep: '01001000',
    street: 'Praça da Sé',
    number: '100',
    complement: null,
    neighborhood: 'Sé',
    city: 'São Paulo',
    state: 'SP',
  },
  contacts_count: 0,
  created_at: '2026-09-02T10:00:00.000000Z',
  updated_at: '2026-09-02T10:00:00.000000Z',
};

interface ListCall {
  filters: PersonFilters;
  page: number;
  perPage: number;
}

class PersonServiceStub {
  readonly requests: Subject<PaginatedResponse<Person>>[] = [];
  immediate = false;
  readonly calls: ListCall[] = [];

  list(filters: PersonFilters, page: number, perPage: number): Observable<PaginatedResponse<Person>> {
    this.calls.push({ filters, page, perPage });

    if (this.immediate) {
      return of(emptyPage);
    }

    const request = new Subject<PaginatedResponse<Person>>();
    this.requests.push(request);

    return request;
  }

  delete(): Observable<void> {
    return of(undefined);
  }
}

describe('PersonList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [PersonList],
      providers: [provideRouter([]), { provide: PersonService, useClass: PersonServiceStub }],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('cancels an outdated request when filters are applied', () => {
    const fixture = TestBed.createComponent(PersonList);
    fixture.detectChanges();

    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    const firstRequest = service.requests[0];
    const filterButton = fixture.nativeElement.querySelector('.filter-button') as HTMLButtonElement;
    filterButton.click();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[formControlName="name"]') as HTMLInputElement;
    input.value = 'Ana';
    input.dispatchEvent(new Event('input'));
    const form = fixture.nativeElement.querySelector('.filters-panel') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(service.requests).toHaveLength(2);
    expect(firstRequest.observed).toBe(false);
    expect(service.calls[1]).toEqual({
      filters: { name: 'Ana', cpf: '', phone: '' },
      page: 1,
      perPage: 5,
    });
  });

  it('reloads the grid when the browser tab receives focus', () => {
    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    service.immediate = true;
    const fixture = TestBed.createComponent(PersonList);
    fixture.detectChanges();

    expect(service.calls).toHaveLength(1);
    window.dispatchEvent(new Event('focus'));
    vi.advanceTimersByTime(100);

    fixture.detectChanges();
    expect(service.calls).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma pessoa encontrada');
  });

  it('loads the selected page', () => {
    const fixture = TestBed.createComponent(PersonList);
    fixture.detectChanges();
    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    service.requests[0].next({
      data: [person],
      pagination: { page: 1, last_page: 3, per_page: 10, total: 21 },
    });
    service.requests[0].complete();
    fixture.detectChanges();

    const secondPage = fixture.nativeElement.querySelector('[aria-label="Página 2"]') as HTMLButtonElement;
    secondPage.click();

    expect(service.calls[1].page).toBe(2);
  });
});
