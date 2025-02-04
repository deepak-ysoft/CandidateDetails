import { HttpClient, HttpParams } from '@angular/common/http';
import {  Injectable } from '@angular/core';
import { Candidate } from '../Models/candidate.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  private baseUrl = environment.apiURL;

  isCandidateAddOrUpdate = false;
  private candidateListSubject = new BehaviorSubject<Candidate[]>([]);
  private totalCandidatesSubject = new BehaviorSubject<number>(0);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  candidateList$ = this.candidateListSubject.asObservable();
  totalCandidates$ = this.totalCandidatesSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  private resetFormSubject = new Subject<void>();
  resetForm$ = this.resetFormSubject.asObservable();

  triggerResetForm(): void {
    this.resetFormSubject.next();
  }

  constructor(private http: HttpClient) {}

  getCandidates(
    page: number = 1,
    pageSize: number = 15,
    sortColumn: string = 'id',
    sortDirection: string = 'desc',
    SearchField: string = '',
    SearchValue: string = ''
  ): void {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sortColumn', sortColumn)
      .set('sortDirection', sortDirection)
      .set('SearchField', SearchField)
      .set('SearchValue', SearchValue);

    this.http
      .get(`${this.baseUrl}api/Candidate/GetCandidates`, { params })
      .subscribe({
        next: (data: any) => {
          this.candidateListSubject.next(data.data);
          this.totalCandidatesSubject.next(data.totalCount);
          this.totalPagesSubject.next(Math.ceil(data.totalCount / pageSize));
        },
        error: (error) => {
          // console.error('Error fetching candidates:', error);
        },
      });
  }

  UploadExcel(excel: FormData) {
    return this.http.post(
      `${this.baseUrl}api/Candidate/AddCandidatesFromExcel`,
      excel
    );
  }

  uploadCV(cv: FormData) {
    return this.http.post(`${this.baseUrl}api/Resume/UploadResume`, cv);
  }


  confirmDelete() {
    return Swal.fire({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    });
  }


  AddEditCandidate(data: FormData) {
    this.isCandidateAddOrUpdate = true;
    return this.http.post(`${this.baseUrl}api/Candidate/AddEditCandidate`, data);
  }

  deleteCandidate(id: number) {
    return this.http.delete(`${this.baseUrl}api/Candidate/DeleteCandidate/${id}`);
  }

  downloadCV(candidateId: number) {
    const url = `${this.baseUrl}api/Candidate/DownloadCV/${candidateId}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  downloadExcel() {
    const url = `${this.baseUrl}api/Candidate/DownloadExcel`;
    return this.http.get(url, { responseType: 'blob' });
  }

  GetCandidate(candidateId: number) {
    return this.http.get(
      `${this.baseUrl}api/Candidate/GetCandidate/${candidateId}`
    );
  }

  getWeekAndTodayData() {
    return this.http.get(`${this.baseUrl}api/Candidate/getWeekAndTodayData`);
  }
}
