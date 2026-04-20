import { type Routes } from '@angular/router';

export const groceryListRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/grocery-list-page/grocery-list-page').then((m) => m.GroceryListPage),
    title: 'Grocery List',
  },
];
