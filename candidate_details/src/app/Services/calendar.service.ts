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
    return this.http.get(`${this.baseUrl}Calendar/GetEventList`);
  }

  insertCalendar(Calendar: any) {
    return this.http.post(
      `${this.baseUrl}Calendar/CreateEditCalendar`,
      Calendar
    );
  }

  updateCalendar(
    id: string,
    newStart: string,
    newEnd: string
  ): Observable<any> {
    const payload = { id, newStart, newEnd };
    return this.http.post(`${this.baseUrl}Calendar/UpdateCalendar`, payload);
  }
  successDelete(id: number) {
    return this.http.delete(`${this.baseUrl}Calendar/DeleteCalendar/${id}`);
  }
}
