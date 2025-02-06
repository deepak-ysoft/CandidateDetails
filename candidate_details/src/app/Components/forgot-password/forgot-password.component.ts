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
      this.authService.forgotPassword(this.email).subscribe((response: any) => {
        if (response.success) {
          Swal.fire({
            title: 'Done! 🎉',
            text: 'Password reset link sent to your email!',
            icon: 'success',
            timer: 2000, // Auto-close after 2 seconds
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            title: 'Error! &#128078;',
            text: 'Failed to send reset link. Please try again.',
            icon: 'error',
            timer: 2000, // Auto close after 2000 milliseconds
            showConfirmButton: false,
          });
        }
      });
    }
  }
}
