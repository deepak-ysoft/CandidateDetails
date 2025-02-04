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
import { UnauthorizedComponent } from './Components/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], // Protect the entire layout
    data: { roles: ['Admin', 'HR', 'Employee'] },
    children: [
      { path: '', redirectTo: 'index', pathMatch: 'full' }, // Redirect to index
      {
        path: 'index',
        component: IndexComponent,
        canActivate: [authGuard],
         data: { roles: ['Admin', 'HR'] },
      },
      {
        path: 'candidateList',
        component: CandidateListComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'HR'] },
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'HR'] },
      },
      {
        path: 'calendar',
        component: CalendarComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'HR', 'Employee'] },
      },
      {
        path: 'employees',
        component: EmployeesComponent,
        canActivate: [authGuard],
         data: { roles: ['Admin', 'HR', 'Employee'] },
      },
      {
        path: 'employee-details',
        component: EmployeeDetailsComponent,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'HR', 'Employee'] },
        runGuardsAndResolvers: 'always', // Force reload when navigating to the same route
      },
    ],
  },
  { path: 'login', component: LoginComponent }, // Ensure login is separate & not protected
  { path: 'unauthorized', component: UnauthorizedComponent }, // Unauthorized page
  { path: '**', redirectTo: 'index' }, // Catch-all for unknown routes
];
