import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PersonFilters, PersonPayload } from '../models/person.model';
import { PersonService } from './person';

describe('PersonService', () => {
  let service: PersonService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PersonService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends pagination and filter parameters', () => {
    const filters: PersonFilters = { name: 'Maria', cpf: '529.982', phone: '(11) 99999' };
    service.list(filters, 2, 15).subscribe();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === '/api/people' &&
        candidate.params.get('name') === 'Maria' &&
        candidate.params.get('cpf') === '529982' &&
        candidate.params.get('phone') === '1199999' &&
        candidate.params.get('page') === '2' &&
        candidate.params.get('per_page') === '15',
    );

    expect(request.request.method).toBe('GET');
    request.flush({
      data: [],
      pagination: { page: 2, last_page: 2, per_page: 15, total: 0 },
    });
  });

  it('creates a person using the API', () => {
    const payload: PersonPayload = {
      name: 'Maria Silva',
      cpf: '529.982.247-25',
      phone: '(11) 99999-8888',
      address: { cep: '01001-000', number: '100', complement: null },
    };

    service.create(payload).subscribe();

    const request = http.expectOne('/api/people');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { id: 1 } });
  });

  it('looks up an address by CEP', () => {
    service.lookupCep('01001000').subscribe();

    const request = http.expectOne('/api/cep/01001000');
    expect(request.request.method).toBe('GET');
    request.flush({
      data: {
        cep: '01001000',
        street: 'Praça da Sé',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP',
      },
    });
  });
});
