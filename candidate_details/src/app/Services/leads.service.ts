import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Leads } from '../Models/leads.model';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private baseUrl = environment.apiURL;

  isLeadsAddOrUpdate = false;
  private LeadsListSubject = new BehaviorSubject<Leads[]>([]);
  private totalLeadsSubject = new BehaviorSubject<number>(0);
  private totalPagesSubject = new BehaviorSubject<number>(0);

  LeadsList$ = this.LeadsListSubject.asObservable();
  totalLeads$ = this.totalLeadsSubject.asObservable();
  totalPages$ = this.totalPagesSubject.asObservable();

  private resetFormSubject = new Subject<void>();
  resetForm$ = this.resetFormSubject.asObservable();

  triggerResetForm(): void {
    this.resetFormSubject.next();
  }

  constructor(private http: HttpClient) {}

  getLeads(
    page: number = 1,
    pageSize: number = 15,
    SearchField: string = '',
    SearchValue: string = ''
  ): void {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('SearchField', SearchField)
      .set('SearchValue', SearchValue);

    this.http.get(`${this.baseUrl}api/Leads/GetLeads`, { params }).subscribe({
      next: (data: any) => {
        this.LeadsListSubject.next(data.data);
        this.totalLeadsSubject.next(data.totalCount);
        this.totalPagesSubject.next(Math.ceil(data.totalCount / pageSize));
      },
      error: (error) => {
        // console.error('Error fetching Leads:', error);
      },
    });
  }

  UploadExcel(excel: FormData) {
    return this.http.post(`${this.baseUrl}api/Leads/AddLeadsFromExcel`, excel);
  }


  AddEditLeads(data: FormData) {
    this.isLeadsAddOrUpdate = true;
    return this.http.post(`${this.baseUrl}api/Leads/AddEditLeads`, data);
  }

  deleteLeads(id: number) {
    return this.http.delete(`${this.baseUrl}api/Leads/DeleteLeads/${id}`);
  }

  downloadExcel() {
    const url = `${this.baseUrl}api/Leads/DownloadExcel`;
    return this.http.get(url, { responseType: 'blob' });
  }

  GetLeads(LeadsId: number) {
    return this.http.get(`${this.baseUrl}api/Leads/GetLeads/${LeadsId}`);
  }
}
