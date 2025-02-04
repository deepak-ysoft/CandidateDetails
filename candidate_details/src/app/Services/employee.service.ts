import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { EmployeeLeave } from '../Models/employeeLeave.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChangeEmpPassword } from '../Models/changeEmpPassword.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../Models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  empImage: string = '';
  defaultImage: string = 'assets/Image/Default.jpg'; // Path to default image
  selectedImage: string = this.empImage + this.defaultImage;
  empRole = 3;
  private baseUrl = environment.apiURL;
  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.empImage = `${this.baseUrl}` + `uploads/images/employee/`;
  }

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

  getEmployeeById(empId: number) {
    return this.http.get(
      `${this.baseUrl}api/Employee/GetEmployeeById/${empId}`
    );
  }

  createEmployeeForm(): FormGroup {
    return this.fb.group(
      {
        empId: [0],
        roleId: [3],
        empName: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[A-Za-z\s]+(?: [A-Za-z0-9\s]+)*$/),
          ],
        ],
        empEmail: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/),
          ],
        ],
        empPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        empPasswordConfirm: ['', Validators.required],
        empNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        empDateOfBirth: ['', Validators.required],
        empGender: ['', Validators.required],
        empJobTitle: ['', Validators.required],
        empExperience: ['', Validators.required],
        empDateofJoining: ['', Validators.required],
        empAddress: ['', [Validators.required]],
        photo: [null],
      },
      { validator: this.passwordMatchValidator }
    );
  }
  editEmployee(employeeForm: FormGroup, employee: Employee): string {
    // Assign employee's imagePath to selectedImage
    this.selectedImage = employee.imagePath
      ? this.empImage + employee.imagePath
      : this.empImage + this.defaultImage;

    employeeForm.patchValue({
      empId: employee.empId,
      empName: employee.empName,
      empEmail: employee.empEmail,
      empPassword: employee.empPassword,
      empNumber: employee.empNumber,
      empDateOfBirth: employee.empDateOfBirth,
      empGender: employee.empGender,
      empJobTitle: employee.empJobTitle,
      empExperience: employee.empExperience,
      empDateofJoining: employee.empDateofJoining,
      empAddress: employee.empAddress,
    });

    return this.selectedImage;
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('empPassword')?.value;
    const confirmPassword = group.get('empPasswordConfirm')?.value;
    return password === confirmPassword ? null : { mismatch: true };
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
