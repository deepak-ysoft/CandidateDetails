import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Candidate } from '../Models/candidate.model';

@Injectable({
  providedIn: 'root',
})
export class CommonServiceService {
  candidateForm?: any;
  candidateData: any;
  private candidateSubject = new BehaviorSubject<Candidate>(new Candidate());
  candidateData$ = this.candidateSubject.asObservable();
  private employeeCount = new BehaviorSubject<number>(0);
  private todayDataCount = new BehaviorSubject<number>(0);

  employeeCount$ = this.employeeCount.asObservable();
  todayDataCount$ = this.todayDataCount.asObservable();

  constructor() {}
  getCandidateForm() {
    return this.candidateForm;
  }
  addCandidateForm(form: any) {
    this.candidateForm = form;
  }

  setCandidateData(data: any) {
    this.candidateSubject.next(data);
  }

  updateEmployeeList(employeeCount: number) {
    this.employeeCount.next(employeeCount);
  }

  updateTodayData(TodayDataCount: number) {
    this.todayDataCount.next(TodayDataCount);
  }
}
