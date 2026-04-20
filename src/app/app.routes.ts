import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'grocery-list',
  },
  {
    path: 'grocery-list',
    loadChildren: () =>
      import('./features/grocery-list/grocery-list.routes').then((m) => m.groceryListRoutes),
  },
  {
    path: '**',
    redirectTo: 'grocery-list',
  },
];
