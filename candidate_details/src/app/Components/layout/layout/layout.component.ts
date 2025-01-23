import { Component, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CandidateService } from '../../../Services/candidate.service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Emit the initial route on component load
    this.currentRouteSubject.next(this.router.url);

    // Update the route on navigation events
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRouteSubject.next(event.url);
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
}
