import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../Models/login.model';
import { BehaviorSubject } from 'rxjs';
import { EmployeeService } from '../../Services/employee.service';
import { EmpLocalStorService } from '../../Services/emp-local-stor.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  employeeService = inject(EmployeeService);
  employeeForm: FormGroup;
  login: Login;
  submitted = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();
  localStorageService = inject(EmpLocalStorService);
  showConPassword = false;
  selectedFile: any = null;
  defaultImage: string = 'assets/Image/Default.jpg'; // Path to default image
  selectedImage: string | null = null; // For showing the selected image
  show = false;
  userRole: string | null = null;
  isLogin = true;

  ngOnInit(): void {
    this.showConPassword = false;
    this.show = false;
    this.employeeForm.reset();
    this.employeeForm.markAsPristine(); // Reset validation state
    this.employeeForm.markAsUntouched(); // Remove touched status
    this.submitted = false;
  }
  constructor(private fb: FormBuilder) {
    this.submitted = false;
    this.isLogin = true;
    this.login = new Login();
    this.userRole = this.authService.getRole();
    //remove localstorage data on load page
    localStorage.removeItem('userEmailForResetPassword');

    this.employeeForm = this.employeeService.createEmployeeForm();
  }

  onLoginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
      ),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    ]),
  });

  FlipAnother() {
    this.isLogin = !this.isLogin;
  }

  loggedUser: any;
  // To login user
  onlogin() {
    this.submitted = true;
    this.authService.loginService(this.onLoginForm.value).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.authService.storeToken(response.token.result);
          this.localStorageService.setEmp(response);
          this.onLoginForm.reset();
          this.onLoginForm.markAsPristine();
          this.onLoginForm.markAsUntouched();
          this.submitted = false;
          this.userRole = this.authService.getRole();
          if (this.userRole === 'Employee') {
            this.router.navigateByUrl('/calendar');
          } else {
            this.router.navigateByUrl('/index');
          }
        } else if (response.message == 'Your account is not active.') {
          Swal.fire({
            title: 'Pending activation! &#128522;',
            text: 'Your account is not active :)',
            icon: 'error',
            timer: 2000, // Auto-close after 2 seconds
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            title: 'Wrong info! &#128544;',
            text: 'Email or password is wrong :)',
            icon: 'error',
            timer: 2000, // Auto-close after 2 seconds
            timerProgressBar: true,
          });
        }
      },
      error: (err: any) => {
        // Handle validation errors from the server
        if (err.status === 400) {
          const validationErrors = err.error.errors;
          for (const field in validationErrors) {
            const formControl = this.onLoginForm.get(
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

  onSubmit() {
    this.submitted = true;
    var formData = new FormData();
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

      formData.append(
        'empPassword',
        this.employeeForm.get('empPassword')?.value || ''
      );
      formData.append(
        'empPasswordConfirm',
        this.employeeForm.get('empPasswordConfirm')?.value || ''
      );

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
      let role = 7;

      formData.append('roleId', role.toString());

      this.employeeService.addEmployee(formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.isLogin = true;
            this.employeeForm.reset();
            this.employeeForm.markAsPristine(); // Reset validation state
            this.employeeForm.markAsUntouched(); // Remove touched status
            this.submitted = false;
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

  Show() {
    this.show = !this.show;
  }
  ShowConPassword() {
    this.showConPassword = !this.showConPassword;
  }
  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.onLoginForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
  shouldShowRegisterError(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
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
