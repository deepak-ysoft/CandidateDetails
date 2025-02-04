import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CandidateService } from '../../../Services/candidate.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { AuthService } from '../../../Services/auth.service';
import { EmployeeService } from '../../../Services/employee.service';
import { EmpLocalStorService } from '../../../Services/emp-local-stor.service';
import { environment } from '../../../../environments/environment';
import { Employee } from '../../../Models/employee.model';
import { CommonServiceService } from '../../../Services/common-service.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  candidateService = inject(CandidateService);
  employeeService = inject(EmployeeService);
  empLocalstorageService = inject(EmpLocalStorService);
  commonservice = inject(CommonServiceService);
  authService = inject(AuthService);
  userRole: string | null = null;
  private baseUrl = environment.apiURL;
  empImage: string;
  private currentRouteSubject = new BehaviorSubject<string>('');
  currentRoute$: Observable<string> = this.currentRouteSubject.asObservable();
  todayDataCount = 0;
  showExcelDownload = false;
  showRoleButton = false;
  reqEmpCount = 0;
  loggedEmp: any;
  reqLeaveCount = 0;
  reqestedEmployeeList: Employee[] = [];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.userRole = this.authService.getRole();
    this.empImage = `${this.baseUrl}` + `uploads/images/employee/`;

    this.commonservice.employeeCount$.subscribe((count) => {
      this.reqEmpCount = count;
    });
  }
  // Safely access localStorage only in the browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  ngOnInit(): void {
    this.getCurrentEmpData();

    this.employeeService.GetLeave(this.loggedEmp.employee.empId); // Trigger data fetch
    this.employeeService.empLeaveRequestList$.subscribe((empLeave) => {
      this.reqLeaveCount = empLeave.length;
    });
    // Emit the initial route on component load
    this.currentRouteSubject.next(this.router.url);

    // Update the route on navigation events
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRouteSubject.next(event.url);
      });
    this.currentRoute$.subscribe((route) => {
      console.log('Current route:', route);

      // Perform actions based on the route
      if (route === '/candidateList') {
        this.showExcelDownload = true;
        this.showRoleButton = false;
      } else if (route === '/index' || route === '/') {
        this.showRoleButton = true;
        this.showExcelDownload = false;
      } else {
        this.showExcelDownload = false;
        this.showRoleButton = false;
      }
    });
    if (this.userRole !== 'Employee') {
      this.employeeService.getEmployee().subscribe((res: any) => {
        if (res.success) {
          this.reqestedEmployeeList = res.requestres;
          this.reqEmpCount = res.reqEmpCount;
          this.commonservice.updateEmployeeList(this.reqEmpCount); // Update the shared service
        }
      });
    }
    this.getWeekData();
  }
  getCurrentEmpData() {
    debugger;
    this.empLocalstorageService.emp$.subscribe((emp) => {
      this.loggedEmp = emp;
    });
  }

  employeeProfile(emp: Employee) {
    this.router.navigate(['employee-details'], {
      state: { empId: emp.empId },
    });
  }

  getWeekData() {
    this.candidateService.getWeekAndTodayData().subscribe((res: any) => {
      if (res.res) {
        this.todayDataCount = res.todayDataCount;
        this.commonservice.updateTodayData(this.todayDataCount);
      }
    });
  }

  downloadCandidateExcel() {
    this.candidateService.downloadExcel().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CandidateDetails.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        // console.error(err);
        alert('Error downloading CV.');
      },
    });
  }

  logOut() {
    this, this.router.navigateByUrl('/login');
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
      localStorage.clear();
    }
  }
}
