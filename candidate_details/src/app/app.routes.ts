import { Routes } from '@angular/router';
import { CandidateListComponent } from './Components/candidate-list/candidate-list.component';
import { RolesComponent } from './Components/roles/roles.component';
import { LayoutComponent } from './Components/layout/layout/layout.component';
import { CalendarComponent } from './Components/calendar/calendar.component';
import { EmployeesComponent } from './Components/Employee/employees/employees.component';
import { EmployeeDetailsComponent } from './Components/Employee/employee-details/employee-details.component';
import { LoginComponent } from './Components/login/login.component';
import { authGuard } from './Services/auth.guard';
import { IndexComponent } from './Components/index/index.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '', // Redirect to candidateList by default
        pathMatch: 'full',
      },
      {
        path: '',
        component: IndexComponent,
      },
      {
        path: 'index',
        component: IndexComponent,
      },
      {
        path: 'CandidateList',
        component: CandidateListComponent,
      },
      {
        path: 'roles',
        component: RolesComponent,
      },
      {
        path: 'calendar',
        component: CalendarComponent,
      },
      {
        path: 'employees',
        component: EmployeesComponent,
      },
      {
        path: 'employee-details',
        component: EmployeeDetailsComponent,
      },
    ],
  },
  {
    path: '',
    component: LoginComponent, // Login route (no guard needed here)
  },
  {
    path: 'login',
    component: LoginComponent, // Login route (no guard needed here)
  },
  { path: '**', redirectTo: '' },
];
