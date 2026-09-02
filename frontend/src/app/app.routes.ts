import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'people' },
  {
    path: 'people',
    loadComponent: () =>
      import('./features/people/pages/person-list/person-list').then((component) => component.PersonList),
  },
  {
    path: 'people/new',
    loadComponent: () =>
      import('./features/people/pages/person-form/person-form').then((component) => component.PersonForm),
  },
  {
    path: 'people/:id/edit',
    loadComponent: () =>
      import('./features/people/pages/person-form/person-form').then((component) => component.PersonForm),
  },
  {
    path: 'people/:id',
    loadComponent: () =>
      import('./features/people/pages/person-details/person-details').then((component) => component.PersonDetails),
  },
  { path: '**', redirectTo: 'people' },
];
