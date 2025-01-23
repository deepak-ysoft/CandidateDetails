import { Routes } from '@angular/router';
import { CandidateListComponent } from './Components/candidate-list/candidate-list.component';
import { RolesComponent } from './Components/roles/roles.component';
import { LayoutComponent } from './Components/layout/layout/layout.component';
import { CalendarComponent } from './Components/calendar/calendar.component';
import { EmployeesComponent } from './Components/Employee/employees/employees.component';
import { EmployeeDetailsComponent } from './Components/Employee/employee-details/employee-details.component';
import { LoginComponent } from './Components/login/login.component';
import { authGuard } from './Guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], // Protect all child routes
    children: [
      {
        path: '',
        redirectTo: 'candidateList', // Redirect to candidateList by default
        pathMatch: 'full',
      },
      {
        path: 'candidateList',
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
];
