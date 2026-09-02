import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact';

describe('ContactService', () => {
  let service: ContactService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates a contact for a person', () => {
    const payload = { type: 'email' as const, value: 'maria@example.com' };
    service.create(10, payload).subscribe();

    const request = http.expectOne('/api/people/10/contacts');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { id: 1 } });
  });

  it('deletes a contact', () => {
    service.delete(5).subscribe();

    const request = http.expectOne('/api/contacts/5');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
