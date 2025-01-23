import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Employee } from '../Models/employee.model';
import { EmployeeLeave } from '../Models/employeeLeave.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { Login } from '../Models/login.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiURL;
  constructor(private http: HttpClient) {}

  private empLeaveListSubject = new BehaviorSubject<EmployeeLeave[]>([]);
  private totalEmpLeaveSubject = new BehaviorSubject<number>(0);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  empLeaveList$ = this.empLeaveListSubject.asObservable();
  totalempLeave$ = this.totalEmpLeaveSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  login(login: Login) {
    return this.http.post(`${this.baseUrl}Employee/Login`, login);
  }

  getEmployee() {
    return this.http.get(`${this.baseUrl}Employee/GetEmployees`);
  }

  addUpdateEmployee(emp: FormData) {
    return this.http.post(`${this.baseUrl}Employee/AddUpdateEmployee`, emp);
  }

  deleteEmployee(empId: number) {
    return this.http.delete(`${this.baseUrl}Employee/DeleteEmployee/${empId}`);
  }

  // Leave

  GetLeave(empId: number, page: number = 1): void {
    const params = new HttpParams().set('empId', empId).set('page', page);

    this.http
      .get(`${this.baseUrl}EmployeesLeave/GetEmployeesLeave`, { params })
      .subscribe({
        next: (data: any) => {
          this.empLeaveListSubject.next(data.data);
          this.totalEmpLeaveSubject.next(data.totalCount);
          this.totalPagesSubject.next(Math.ceil(data.totalCount / 10));
        },
        error: (error) => {
          // console.error('Error fetching candidates:', error);
        },
      });
  }

  addUpdateEmployeeLeave(emp: EmployeeLeave) {
    return this.http.post(
      `${this.baseUrl}EmployeesLeave/AddUpdateEmployeeLeave`,
      emp
    );
  }

  deleteEmployeeLeave(empId: number) {
    return this.http.delete(
      `${this.baseUrl}EmployeesLeave/DeleteEmployeeLeave/${empId}`
    );
  }

  // to update notifications after login
  private eventSubject = new Subject<void>();
  triggerSomeEvent() {
    debugger;
    this.eventSubject.next();
  }
  getEventSubject(): Subject<void> {
    return this.eventSubject;
  }
}
