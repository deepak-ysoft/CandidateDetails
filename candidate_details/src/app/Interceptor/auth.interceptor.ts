import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService); // Inject spinner service

  spinner.show(); // Show spinner when API request starts

  return next(req).pipe(
    finalize(() => {
      spinner.hide(); // Hide spinner when request completes
    })
  );
};