import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResource, PaginatedResponse } from '../models/api.model';
import { AddressLookup, Person, PersonFilters, PersonPayload } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly peopleUrl = `${this.apiUrl}/api/people`;

  list(filters: PersonFilters, page: number, perPage: number): Observable<PaginatedResponse<Person>> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    const name = filters.name.trim();
    const cpf = filters.cpf.replace(/\D/g, '');
    const phone = filters.phone.replace(/\D/g, '');

    if (name) {
      params = params.set('name', name);
    }

    if (cpf) {
      params = params.set('cpf', cpf);
    }

    if (phone) {
      params = params.set('phone', phone);
    }

    return this.http.get<PaginatedResponse<Person>>(this.peopleUrl, { params });
  }

  get(id: number): Observable<ApiResource<Person>> {
    return this.http.get<ApiResource<Person>>(`${this.peopleUrl}/${id}`);
  }

  lookupCep(cep: string): Observable<ApiResource<AddressLookup>> {
    return this.http.get<ApiResource<AddressLookup>>(`${this.apiUrl}/api/cep/${cep}`);
  }

  create(payload: PersonPayload): Observable<ApiResource<Person>> {
    return this.http.post<ApiResource<Person>>(this.peopleUrl, payload);
  }

  update(id: number, payload: PersonPayload): Observable<ApiResource<Person>> {
    return this.http.patch<ApiResource<Person>>(`${this.peopleUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.peopleUrl}/${id}`);
  }
}
