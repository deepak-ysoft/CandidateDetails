import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmpLocalStorService {
  private empKey = 'emp'; // Key for localStorage
  private empSubject: BehaviorSubject<any>; // Subject for emitting emp data
  public emp$: Observable<any>; // Observable to subscribe to for emp data

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize emp$ after checking the emp data from localStorage
    if (this.isBrowser()) {
      const empData = this.getEmpFromStorage();
      this.empSubject = new BehaviorSubject<any>(empData);
    } else {
      this.empSubject = new BehaviorSubject<any>(null); // Default to null if not in the browser
    }
    this.emp$ = this.empSubject.asObservable();
  }

  // Safely access localStorage only in the browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getEmpFromStorage(): any {
    if (this.isBrowser()) {
      const empData = localStorage.getItem(this.empKey);
      return empData ? JSON.parse(empData) : null;
    }
    return null;
  }

  setEmp(emp: any): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.empKey, JSON.stringify(emp));
    }
    this.empSubject.next(emp); // Notify subscribers with the new user
  }

  clearEmp(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.empKey);
    }
    this.empSubject.next(null); // Notify subscribers with null
  }

  getCurrentEmp(): any {
    return this.empSubject.getValue();
  }
}
