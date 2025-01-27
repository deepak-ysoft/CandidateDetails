import { Component, inject, OnInit } from '@angular/core';
import { CandidateService } from '../../Services/candidate.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Candidate } from '../../Models/candidate.model';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-index',
  imports: [CommonModule, DatePipe,MatTooltipModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent implements OnInit {
  candidateService = inject(CandidateService);
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
    this.getLastWeekData();
    let isLoggedIn;
    setInterval(() => {
      isLoggedIn = localStorage.getItem('authToken'); // Example check for JWT token
    }, 5000);

    debugger;
    if (isLoggedIn) {
      setInterval(() => {
        this.getLastWeekData();
      }, 5000);
    }
  }

  constructor() {
    this.showCandidate = false;
  }
  getLastWeekData() {
    this.candidateService.getWeekAndTodayData().subscribe((res: any) => {
      if (res.res) {
        this.weekData = res.weekData;
        this.todayData = res.todayData;
      }
    });
  }

  CanidtateDetals(candidate: Candidate) {
    this.candidate = candidate;
    this.showCandidate = true;
  }
}
