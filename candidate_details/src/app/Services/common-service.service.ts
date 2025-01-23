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
}
