import { Component, inject, OnInit } from '@angular/core';
import { CandidateService } from '../../Services/candidate.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Candidate } from '../../Models/candidate.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  imports: [CommonModule, DatePipe, MatTooltipModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent implements OnInit {
  candidateService = inject(CandidateService);
  authService = inject(AuthService);
  router = inject(Router);
  userRole: string | null = null;
  weekData: Candidate[] = [];
  todayData: Candidate[] = [];
  candidate: Candidate = new Candidate();
  showCandidate = false;
  PageNumber: number = 1;
  currentPage = 1;
  totalpages = 0;
  totalEmpLeave = 0;
  firstCandidateOfPage = 1;
  lastCandidateOfPage = 10;

  ngOnInit(): void {
    if (this.userRole === 'Employee') {
      this.router.navigateByUrl('/calendar');
    }
    this.getLastWeekData();
    let isLoggedIn;
    setInterval(() => {
      isLoggedIn = localStorage.getItem('authToken'); // Example check for JWT token
    }, 5000);

    if (isLoggedIn) {
      setInterval(() => {
        this.getLastWeekData();
      }, 5000);
    }
  }

  constructor() {
    this.userRole = this.authService.getRole();
    this.showCandidate = false;
  }

  todayDataLength = 0;
  weekDataLength = 0;
  getLastWeekData() {
    this.candidateService.getWeekAndTodayData().subscribe((res: any) => {
      if (res.res) {
        this.weekData = res.weekData;
        this.todayData = res.todayData;
        this.todayDataLength = this.todayData.length;
        this.weekDataLength = this.weekData.length;
      }
    });
  }

  CanidtateDetals(candidate: Candidate) {
    this.candidate = candidate;
    this.showCandidate = true;
  }
}
