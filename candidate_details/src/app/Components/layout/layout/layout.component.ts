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
  imports: [DatePipe, RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  candidateService = inject(CandidateService);
  private currentRouteSubject = new BehaviorSubject<string>('');
  currentRoute$: Observable<string> = this.currentRouteSubject.asObservable();

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
    this.getLastWeekData();
    setInterval(() => {
      this.getLastWeekData();
    }, 5000);
  }

  lastWeekDataCount = 0;
  lastWeekData: Candidate[] = [];
  getLastWeekData() {
    this.candidateService.getLastWeekData().subscribe((res: any) => {
      if (res.res) {
        (this.lastWeekDataCount = res.count), (this.lastWeekData = res.data);
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
      localStorage.clear();
    }
  }
}
