import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { afterEach, vi } from 'vitest';
import { ApiResource } from '../../../../core/models/api.model';
import { AddressLookup, Person } from '../../../../core/models/person.model';
import { PersonService } from '../../../../core/services/person';
import { PersonForm } from './person-form';

const address: AddressLookup = {
  cep: '01001000',
  street: 'Praça da Sé',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
};

const createdPerson: Person = {
  id: 10,
  name: 'Maria Silva',
  cpf: '52998224725',
  phone: '5511999998888',
  address: { ...address, number: '100', complement: null },
  created_at: '2026-09-02T10:00:00.000000Z',
  updated_at: '2026-09-02T10:00:00.000000Z',
};

class PersonServiceStub {
  createCalls = 0;
  lookupCalls = 0;
  createResult: Observable<ApiResource<Person>> = new Subject<ApiResource<Person>>();
  getResult: Observable<ApiResource<Person>> = of({ data: createdPerson });
  lookupResult: Observable<ApiResource<AddressLookup>> = of({ data: address });

  lookupCep(): Observable<ApiResource<AddressLookup>> {
    this.lookupCalls += 1;

    return this.lookupResult;
  }

  get(): Observable<ApiResource<Person>> {
    return this.getResult;
  }

  create(): Observable<ApiResource<Person>> {
    this.createCalls += 1;

    return this.createResult;
  }

  update(): Observable<ApiResource<Person>> {
    return this.createResult;
  }
}

function fillInput(fixture: ComponentFixture<PersonForm>, selector: string, value: string): void {
  const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function prepareValidForm(fixture: ComponentFixture<PersonForm>): void {
  fillInput(fixture, '[formControlName="name"]', 'Maria Silva');
  fillInput(fixture, '[formControlName="cpf"]', '529.982.247-25');
  fillInput(fixture, '[formControlName="phone"]', '(11) 99999-8888');
  fillInput(fixture, '[formControlName="cep"]', '01001-000');
  vi.advanceTimersByTime(350);
  fixture.detectChanges();
  fillInput(fixture, '[formControlName="number"]', '100');
}

describe('PersonForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [PersonForm],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
        { provide: PersonService, useClass: PersonServiceStub },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('shows the address after a valid CEP lookup', () => {
    const fixture = TestBed.createComponent(PersonForm);
    fixture.detectChanges();
    fillInput(fixture, '[formControlName="cep"]', '01001-000');
    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    const preview = fixture.nativeElement.querySelector('.address-lookup--success') as HTMLElement;
    expect(preview.textContent).toContain('Praça da Sé');
    expect(preview.textContent).toContain('São Paulo · SP');
  });

  it('shows required errors only after submitting the form', () => {
    const fixture = TestBed.createComponent(PersonForm);
    fixture.detectChanges();
    const name = fixture.nativeElement.querySelector('[formControlName="name"]') as HTMLInputElement;
    name.dispatchEvent(new Event('focus'));
    name.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.field__error')).toBeNull();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Este campo é obrigatório.');
    expect(fixture.nativeElement.querySelectorAll('.required-mark').length).toBeGreaterThan(0);
  });

  it('does not look up the CEP again when loading an existing person', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap({ id: createdPerson.id }) } },
    });
    const fixture = TestBed.createComponent(PersonForm);
    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    fixture.detectChanges();

    expect(service.lookupCalls).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Praça da Sé');
  });

  it('clears the loading state when the CEP lookup fails', () => {
    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    service.lookupResult = throwError(
      () =>
        new HttpErrorResponse({
          status: 422,
          error: { message: 'CEP não encontrado.', errors: { cep: ['CEP não encontrado.'] } },
        }),
    );
    const fixture = TestBed.createComponent(PersonForm);
    fixture.detectChanges();
    fillInput(fixture, '[formControlName="cep"]', '00000-000');
    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.address-lookup--loading')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('CEP não encontrado.');
  });

  it('blocks repeated submissions while the first request is pending', () => {
    const fixture = TestBed.createComponent(PersonForm);
    fixture.detectChanges();
    prepareValidForm(fixture);

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    form.dispatchEvent(new Event('submit'));

    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    expect(service.createCalls).toBe(1);
  });

  it('shows the CPF conflict returned by the API', () => {
    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    service.createResult = throwError(
      () =>
        new HttpErrorResponse({
          status: 422,
          error: {
            message: 'O CPF informado já está cadastrado.',
            errors: { cpf: ['O CPF informado já está cadastrado.'] },
          },
        }),
    );
    const fixture = TestBed.createComponent(PersonForm);
    fixture.detectChanges();
    prepareValidForm(fixture);

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const messages = fixture.nativeElement.textContent.match(/O CPF informado já está cadastrado\./g);
    expect(messages).toHaveLength(1);

    fillInput(fixture, '[formControlName="cpf"]', '111.444.777-35');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('O CPF informado já está cadastrado.');
  });

  it('returns to the people grid after creating a person', () => {
    const service = TestBed.inject(PersonService) as unknown as PersonServiceStub;
    service.createResult = of({ data: createdPerson });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(PersonForm);
    fixture.detectChanges();
    prepareValidForm(fixture);

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(navigate).toHaveBeenCalledWith(['/people']);
  });
});
