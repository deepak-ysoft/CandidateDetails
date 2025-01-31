import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.apiURL;
  getEventList() {
    return this.http.get(`${this.baseUrl}api/Calendar/GetEventList`);
  }

  insertCalendar(Calendar: any) {
    return this.http.post(
      `${this.baseUrl}api/Calendar/CreateEditCalendar`,
      Calendar
    );
  }

  updateCalendar(
    id: string,
    newStart: string,
    newEnd: string
  ): Observable<any> {
    const payload = { id, newStart, newEnd };
    return this.http.post(`${this.baseUrl}api/Calendar/UpdateCalendar`, payload);
  }
  successDelete(id: number) {
    return this.http.delete(`${this.baseUrl}api/Calendar/DeleteCalendar/${id}`);
  }
}
