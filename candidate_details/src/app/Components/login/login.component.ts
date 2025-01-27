import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../Models/login.model';
import { BehaviorSubject } from 'rxjs';
import { EmployeeService } from '../../Services/employee.service';
import { EmpLocalStorService } from '../../Services/emp-local-stor.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../Services/auth.service';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  login: Login;
  submitted = false;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();
  localStorageService = inject(EmpLocalStorService);
  show = false;

  ngOnInit(): void {
    this.submitted = false;
    this.show = false;
  }
  constructor() {
    this.login = new Login();
    //remove localstorage data on load page
    localStorage.removeItem('userEmailForResetPassword');
  }

  onLoginForm: FormGroup = new FormGroup({
    email: new FormControl('Deepak@gmail.com', [
      Validators.required,
      Validators.pattern(
        /^[a-zA-Z]{5,}[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/
      ),
    ]),
    password: new FormControl('Deepak@123', [
      Validators.required,
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    ]),
  });

  loggedUser: any;
  // To login user
  onlogin() {
    debugger;
    this.submitted = true;
    this.authService.loginService(this.onLoginForm.value).subscribe({
      next: (response: any) => {
        debugger;
        this.authService.storeToken(response.token.result);
        this.localStorageService.setEmp(response);
        this.router.navigateByUrl('/index');
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

  Show() {
    debugger;
    this.show = !this.show;
  }
  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.onLoginForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
}
