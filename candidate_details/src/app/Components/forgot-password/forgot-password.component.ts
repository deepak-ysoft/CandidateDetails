import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  authService = inject(AuthService);
  email: string = '';

  constructor() {}

  onSubmit() {
    if (this.email) {
      this.authService.forgotPassword(this.email).subscribe({
        next: (response: any) => {
          Swal.fire({
            title: 'Done! 🎉',
            text: 'Password reset link sent to your email!',
            icon: 'success',
            timer: 2000, // Auto-close after 2 seconds
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error: (error) => {
          let errorMessage = 'Failed to send reset link. Please try again.';
  
          if (error.status === 400) {
            errorMessage = error.error; // API message, e.g., "Email not found"
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
  
          Swal.fire({
            title: 'Error! ❌',
            text: errorMessage,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Warning! ⚠️',
        text: 'Please enter a valid email address.',
        icon: 'warning',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  }
}
