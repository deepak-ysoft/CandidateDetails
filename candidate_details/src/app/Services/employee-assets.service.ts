import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { EmployeeAssets } from '../Models/employeeAssets.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeAssetsService {
  private baseUrl = environment.apiURL;
  constructor(private http: HttpClient) {}

  getEmployeeAssets(empId: number) {
    return this.http.get(
      `${this.baseUrl}api/Employee/GetEmployeeAssets/${empId}`
    );
  }

  addUpdateEmployeeAssets(assets: EmployeeAssets) {
    return this.http.post(
      `${this.baseUrl}api/Employee/AddUpdateEmployeeAssets`,
      assets
    );
  }

  deleteEmployeeAssets(assetId: number) {
    return this.http.delete(
      `${this.baseUrl}api/Employee/DeleteEmployeeAssets/${assetId}`
    );
  }
}
