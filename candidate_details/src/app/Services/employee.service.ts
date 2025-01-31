import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { EmployeeLeave } from '../Models/employeeLeave.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChangeEmpPassword } from '../Models/changeEmpPassword.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiURL;
  constructor(private http: HttpClient) {}

  private empLeaveListSubject = new BehaviorSubject<EmployeeLeave[]>([]);
  private empLeaveRequestListSubject = new BehaviorSubject<EmployeeLeave[]>([]);
  private totalEmpLeaveSubject = new BehaviorSubject<number>(0);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  empLeaveList$ = this.empLeaveListSubject.asObservable();
  empLeaveRequestList$ = this.empLeaveRequestListSubject.asObservable();
  totalempLeave$ = this.totalEmpLeaveSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  getEmployee() {
    return this.http.get(`${this.baseUrl}api/Employee/GetEmployees`);
  }

  addEmployee(emp: FormData) {
    return this.http.post(`${this.baseUrl}api/Employee/AddEmployee`, emp);
  }
  updateEmployee(emp: FormData) {
    return this.http.post(`${this.baseUrl}api/Employee/UpdateEmployee`, emp);
  }

  deleteEmployee(empId: number) {
    return this.http.delete(
      `${this.baseUrl}api/Employee/DeleteEmployee/${empId}`
    );
  }

  // Leave

  GetLeave(empId: number, page: number = 1): void {
    const params = new HttpParams().set('empId', empId).set('page', page);

    this.http
      .get(`${this.baseUrl}api/EmployeesLeave/GetEmployeesLeave`, { params })
      .subscribe({
        next: (data: any) => {
          this.empLeaveListSubject.next(data.data);
          this.empLeaveRequestListSubject.next(data.reqLeave);
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
      `${this.baseUrl}api/EmployeesLeave/AddUpdateEmployeeLeave`,
      emp
    );
  }

  deleteEmployeeLeave(empId: number) {
    return this.http.delete(
      `${this.baseUrl}api/EmployeesLeave/DeleteEmployeeLeave/${empId}`
    );
  }

  changePassword(changePass: ChangeEmpPassword) {
    debugger;
    return this.http.post(
      `${this.baseUrl}api/Account/ChangePassword`,
      changePass
    );
  }

  // to update notifications after login
  private eventSubject = new Subject<void>();
  triggerSomeEvent() {
    this.eventSubject.next();
  }
  getEventSubject(): Subject<void> {
    return this.eventSubject;
  }
}
