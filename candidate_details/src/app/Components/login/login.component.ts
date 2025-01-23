import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../../Models/login.model';
import { BehaviorSubject } from 'rxjs';
import { EmployeeService } from '../../Services/employee.service';
import { EmpLocalStorService } from '../../Services/emp-local-stor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  router = inject(Router);
  service = inject(EmployeeService);
  login: Login;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();
  localStorageService = inject(EmpLocalStorService);

  ngOnInit(): void {}
  constructor() {
    this.login = new Login();
    //remove localstorage data on load page
    localStorage.removeItem('userEmailForResetPassword');
  }

  loggedUser: any;
  // To login user
  onLogin(login: Login) {
    this.service.login(login).subscribe((res: any) => {
      if (res) {
        this.tokenSubject.next(res.Token);

        localStorage.clear();
        this.localStorageService.setEmp(res);
        //  localStorage.setItem('loginUser', JSON.stringify(res));
        this.service.triggerSomeEvent();
        localStorage.setItem('jwtToken', res.token);
        this.router.navigateByUrl('index'); // navigate user on index page
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Employee name or password is wrong !',
          icon: 'error',
          timer: 2000, // Auto close after 2000 milliseconds
          showConfirmButton: false,
        });
      }
    });
  }
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jwtToken');
    }
    return 'nothing';
  }
}
