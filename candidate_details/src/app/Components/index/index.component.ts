import { Component, inject, OnInit } from '@angular/core';
import { CandidateService } from '../../Services/candidate.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Candidate } from '../../Models/candidate.model';

@Component({
  selector: 'app-index',
  imports: [CommonModule, DatePipe],
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
    setInterval(() => {
      this.getLastWeekData();
    }, 5000);
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
