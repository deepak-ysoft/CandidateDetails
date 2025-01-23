import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    // retieve token from localstorage
    let token;
    if (typeof window !== 'undefined') {
       token = localStorage.getItem('jwtToken');
    }
    const clnReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }, // set token in header
    });
    return next(clnReq);
};
