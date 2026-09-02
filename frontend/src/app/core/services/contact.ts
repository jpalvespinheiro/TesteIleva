import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResource } from '../models/api.model';
import { Contact, ContactPayload } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  create(personId: number, payload: ContactPayload): Observable<ApiResource<Contact>> {
    return this.http.post<ApiResource<Contact>>(`/api/people/${personId}/contacts`, payload);
  }

  update(id: number, payload: ContactPayload): Observable<ApiResource<Contact>> {
    return this.http.patch<ApiResource<Contact>>(`/api/contacts/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/contacts/${id}`);
  }
}
