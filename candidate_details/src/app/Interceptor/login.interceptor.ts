import { HttpInterceptorFn } from '@angular/common/http';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);

   // const busyService = inject(LoadingService);
  // busyService.busy();
  // return next(req).pipe(
  //   delay(10),
  //   finalize(() => busyService.idel())
  // );
};
