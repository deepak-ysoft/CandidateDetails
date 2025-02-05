import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  authService = inject(AuthService);
  resetPasswordForm: FormGroup;
  token: string = '';
  showNewPass = false;
  showConPassword = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        token: [''],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordsMatch }
    );
  }

  ngOnInit() {
    // Get the token from the URL
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token') || '';
    this.submitted = false;
    // Initialize the form
  }

  // Custom Validator to Check if Passwords Match
  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.submitted = true;

      this.resetPasswordForm.get('token')?.setValue(this.token);
      this.authService.ResetPassword(this.resetPasswordForm.value).subscribe({
        next: (response: any) => {
          if (response.success) {
            Swal.fire({
              title: 'Done! 🎉',
              text: 'Password successfully reset!',
              icon: 'success',
              timer: 2000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
            this.router.navigate(['/login']); // Redirect to login page
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.resetPasswordForm.get(
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

  ShowNewPass() {
    this.showNewPass = !this.showNewPass;
  }
  ShowConPassword() {
    this.showConPassword = !this.showConPassword;
  }

  // show server side error if client-side not working
  shouldShowChangePassError(controlName: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
}
