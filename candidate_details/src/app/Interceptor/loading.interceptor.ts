import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, finalize } from 'rxjs';
import { LoadingService } from '../Services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(LoadingService);
  busyService.busy();
  return next(req).pipe(
    delay(10),
    finalize(() => busyService.idel())
  );
};
