import { Routes } from '@angular/router';
import { AssignMembersComponent } from './features/trainers/components/trainer-grid/member-assignment-page.component';
import { TrainerDuesComponent } from './features/trainers/components/trainer-grid/trainer-dues.component';
import { DashboardWidgetComponent } from './features/members/pages/dashboard/dashboard-widget.component';
import { DashboardPage } from './features/members/pages/dashboard/dashboard.component';

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
    component: DashboardPage,
  },
  {
    path: 'classes',
    loadComponent: () =>
      import('./features/members/pages/classes/classes.page').then(
        (m) => m.ClassesPage
      ),
  },
  {
    path: 'trainers/assign-members/:id',
    component: AssignMembersComponent,
  },
  {
    path: 'trainers/:id/assign', // ← /trainers/3/assign
    component: AssignMembersComponent,
  },
  {
    path: 'trainers/:id/dues',
    component: TrainerDuesComponent,
  },
];
