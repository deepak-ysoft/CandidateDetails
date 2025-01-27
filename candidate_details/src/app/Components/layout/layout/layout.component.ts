import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CandidateService } from '../../../Services/candidate.service';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { Candidate } from '../../../Models/candidate.model';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  candidateService = inject(CandidateService);
  private currentRouteSubject = new BehaviorSubject<string>('');
  currentRoute$: Observable<string> = this.currentRouteSubject.asObservable();
  todayDataCount = 0;
  showExcelDownload = false;
  showRoleButton = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  // Safely access localStorage only in the browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
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
    let isLoggedIn;
    setInterval(() => {
      isLoggedIn = localStorage.getItem('authToken'); // Example check for JWT token
    }, 5000);

    debugger;
    this.getWeekData();
    if (isLoggedIn) {
      setInterval(() => {
        this.getWeekData();
      }, 5000);
    }
  }

  getWeekData() {
    this.candidateService.getWeekAndTodayData().subscribe((res: any) => {
      if (res.res) {
        this.todayDataCount = res.todayDataCount;
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
