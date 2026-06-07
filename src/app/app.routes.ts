import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'trainers', pathMatch: 'full' },
  {
    path: 'members',
    loadComponent: () =>
      import('./features/members/pages/member-list/member-list.page').then(
        (m) => m.MemberListPage
      ),
  },
  {
    path: 'trainers',
    loadComponent: () =>
      import('./features/members/pages/trainer-list/trainer-list.page').then(
        (m) => m.TrainerListPage
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/members/pages/dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
  },
  {
    path: 'classes',
    loadComponent: () =>
      import('./features/members/pages/classes/classes.page').then(
        (m) => m.ClassesPage
      ),
  },
];
