import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Employee } from '../../../Models/employee.model';
import { EmployeeService } from '../../../Services/employee.service';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CandidateService } from '../../../Services/candidate.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../Services/auth.service';
import { EmpLocalStorService } from '../../../Services/emp-local-stor.service';
import { EmployeeLeave } from '../../../Models/employeeLeave.model';

@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
})
export class EmployeesComponent implements OnInit {
  @ViewChild('employeeModal', { static: false }) employeeModal!: ElementRef;
  private baseUrl = environment.apiURL;
  empImage: string;
  employeeList: Employee[] = [];
  reqestedEmployeeList: Employee[] = [];
  employee: Employee = new Employee();
  empLocalstorageService = inject(EmpLocalStorService);
  employeeService = inject(EmployeeService);
  candidateService = inject(CandidateService);
  authService = inject(AuthService);
  router = inject(Router);
  userRole: string | null = null;
  closeResult = '';
  EmployeeModelHeader = 'Add Employee';
  employeeForm: FormGroup;
  submitted = false;
  selectedFile: any = null;
  private modalRef: NgbModalRef | null = null; // Store the modal reference
  defaultImage: string = 'assets/Image/Default.jpg'; // Path to default image
  selectedImage: string | null = null; // For showing the selected image
  show = false;
  showConPassword = false;
  reqEmpCount = 0;
  isRequestedEmp = false;
  empRole = 3;
  loggedEmp: any;
  reqLeave: EmployeeLeave[] = [];

  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.userRole = this.authService.getRole();
    this.empImage = `${this.baseUrl}` + `uploads/images/employee/`;
    this.submitted = false;
    this.employeeForm = this.fb.group(
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
            ), // At least one uppercase, one lowercase, one number, one special character, and minimum 8 characters
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
        photo: [null], // Add this line
      },
      { validator: passwordMatchValidator() }
    );
  }

  ngOnInit(): void {
    this.empLocalstorageService.emp$.subscribe((emp) => {
      this.loggedEmp = emp;
    });
    this.employeeService.GetLeave(this.loggedEmp.employee.empId); // Trigger data fetch
    this.employeeService.empLeaveRequestList$.subscribe((empLeave) => {
      this.reqLeave = empLeave;
    });
    if (this.userRole === 'Employee') {
      this.router.navigateByUrl('/calendar');
    }
    this.empImage = `${this.baseUrl}` + `uploads/images/employee/`;
    this.getEmployees();
    this.show = false;
    this.showConPassword = false;
    this.isRequestedEmp = false;
  }

  getEmployees() {
    this.isRequestedEmp = false;
    this.employeeService.getEmployee().subscribe((res: any) => {
      if (res.success) {
        this.employeeList = res.res;
        this.reqestedEmployeeList = res.requestres;
        this.reqEmpCount = res.reqEmpCount;
        this.reqestedEmployeeList = res.requestres;
      }
    });
  }
  hasLeave(empId: number): boolean {
    return this.reqLeave.some((leave) => leave.empId === empId);
  }

  GetRequestedEmployee() {
    if (this.reqEmpCount > 0) {
      this.isRequestedEmp = true;
      this.employeeList = this.reqestedEmployeeList;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Show the selected image
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openModal() {
    this.employeeForm.reset(); // Resets all controls to their initial state
    this.open(this.employeeModal);
    this.EmployeeModelHeader = 'Add Employee';
  }

  editEmployee(Employee: Employee) {
    // Assign the employee's imagePath to selectedImage
    this.selectedImage =
      this.empImage + Employee.imagePath || this.empImage + this.defaultImage;
    this.employeeForm.patchValue({
      empId: Employee.empId,
      empName: Employee.empName,
      empEmail: Employee.empEmail,
      empPassword: Employee.empPassword,
      empNumber: Employee.empNumber,
      empDateOfBirth: Employee.empDateOfBirth,
      empGender: Employee.empGender,
      empJobTitle: Employee.empJobTitle,
      empExperience: Employee.empExperience,
      empDateofJoining: Employee.empDateofJoining,
      empAddress: Employee.empAddress,
      photo: Employee.photo,
    });
    this.EmployeeModelHeader = 'Edit Employee';
    if (!this.isRequestedEmp) {
      this.open(this.employeeModal);
    } else {
      this.onSubmit();
    }
  }

  onSubmit() {
    this.submitted = true;
    var formData = new FormData();

    console.log('Form Submitted:', this.employeeForm.value);
    if (this.EmployeeModelHeader == 'Edit Employee') {
      this.employeeForm.get('empPassword')?.setValue('Same@123');
      this.employeeForm.get('empPasswordConfirm')?.setValue('Same@123');
      formData.append(
        'empPassword',
        this.employeeForm.get('empPassword')?.value || ''
      );
      formData.append(
        'empPasswordConfirm',
        this.employeeForm.get('empPasswordConfirm')?.value || ''
      );
    }
    if (this.selectedFile) {
      // Append the selected file
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    } else {
      // Create a File object for "Default.jpg"
      const defaultFile = new File([''], 'Default.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      formData.append('photo', defaultFile);
    }
    if (this.employeeForm.valid) {
      formData.append('empId', this.employeeForm.get('empId')?.value || 0);
      formData.append('empName', this.employeeForm.get('empName')?.value || '');
      formData.append(
        'empEmail',
        this.employeeForm.get('empEmail')?.value || ''
      );
      if (this.EmployeeModelHeader != 'Edit Employee') {
        formData.append(
          'empPassword',
          this.employeeForm.get('empPassword')?.value || ''
        );
        formData.append(
          'empPasswordConfirm',
          this.employeeForm.get('empPasswordConfirm')?.value || ''
        );
      }
      formData.append(
        'empNumber',
        this.employeeForm.get('empNumber')?.value || ''
      );
      formData.append(
        'empDateOfBirth',
        this.employeeForm.get('empDateOfBirth')?.value || ''
      );
      formData.append(
        'empGender',
        this.employeeForm.get('empGender')?.value || ''
      );
      formData.append(
        'empJobTitle',
        this.employeeForm.get('empJobTitle')?.value || ''
      );
      formData.append(
        'empExperience',
        this.employeeForm.get('empExperience')?.value || ''
      );
      formData.append(
        'empDateofJoining',
        this.employeeForm.get('empDateofJoining')?.value || ''
      );
      formData.append(
        'empAddress',
        this.employeeForm.get('empAddress')?.value || ''
      );
      formData.append('roleId', this.employeeForm.get('roleId')?.value || '3');

      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      this.employeeService.updateEmployee(formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.employeeForm.reset();
            this.closeModal();
            this.getEmployees();

            Swal.fire({
              title: 'Done! &#128522;',
              text: 'Employee Added.',
              icon: 'success',
              timer: 1000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          } else {
            if (res.message == 'Duplicate Email') {
              Swal.fire({
                title: 'Duplicate Email! &#128078;',
                text: 'Email already exist :)',
                icon: 'error',
                timer: 2000, // Auto-close after 2 seconds
                timerProgressBar: true,
              });
            } else {
              Swal.fire({
                title: 'Cancelled! &#128078;',
                text: 'Something is wrong :)',
                icon: 'error',
                timer: 2000, // Auto-close after 2 seconds
                timerProgressBar: true,
              });
            }
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.employeeForm.get(
                field.charAt(0).toLowerCase() + field.slice(1)
              );
              if (formControl) {
                formControl.setErrors({
                  serverError: validationErrors[field].join(' '),
                });
              }
            }
          }
        },
      });
    }
  }
  DeleteEmployee(empId: number) {
    this.candidateService.confirmDelete().then((result: any) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(empId).subscribe((res: any) => {
          if (res.success) {
            this.getEmployees();
          } else {
            Swal.fire({
              title: 'Cancelled! &#128078;',
              text: 'Something is wrong :)',
              icon: 'error',
              timer: 2000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          }
        });
      }
    });
  }

  employeeDetails(emp: Employee) {
    this.router.navigate(['employee-details'], {
      state: { emp: emp },
    });
  }

  open(content: any) {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });

    this.modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.modalRef = null; // Reset modal reference
      },
      (reason) => {
        this.closeResult = `Dismissed`;
        this.modalRef = null; // Reset modal reference
      }
    );
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
      this.modalRef = null; // Reset modal reference
    }
  }
  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }

  Show() {
    this.show = !this.show;
  }
  ShowConPassword() {
    this.showConPassword = !this.showConPassword;
  }
}

// copmare password validation
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('empPassword')?.value;
    const cPassword = control.get('empPasswordConfirm')?.value;

    return password === cPassword ? null : { mismatch: true };
  };
}
