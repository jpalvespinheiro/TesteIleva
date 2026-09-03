import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource } from '../models/api.model';
import { Contact, ContactPayload } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly contactsUrl = `${environment.apiUrl}/api/contacts`;
  private readonly peopleUrl = `${environment.apiUrl}/api/people`;

  create(personId: number, payload: ContactPayload): Observable<ApiResource<Contact>> {
    return this.http.post<ApiResource<Contact>>(`${this.peopleUrl}/${personId}/contacts`, payload);
  }

  update(id: number, payload: ContactPayload): Observable<ApiResource<Contact>> {
    return this.http.patch<ApiResource<Contact>>(`${this.contactsUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.contactsUrl}/${id}`);
  }
}
