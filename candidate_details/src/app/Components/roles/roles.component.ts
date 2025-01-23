import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Roles } from '../../Models/Roles.model';
import { CandidateService } from '../../Services/candidate.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  roleForm: FormGroup;
  roleEdit: Roles = new Roles();
  formType: string = 'Add Role';

  RolesList: Roles[] = [];
  constructor(
    private candidateService: CandidateService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      rid: [null],
      role: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.getRoles();
    this.formType = 'Add Role';
  }

  editRole(role: Roles) {
    this.onAdd();
    this.formType = 'Edit Role';
    this.roleEdit = role;
    if (role.rid) {
      this.roleForm.patchValue({
        rid: role.rid,
        role: role.role,
      });
    }
  }

  getRoles() {
    this.candidateService.getRoles().subscribe((res: any) => {
      this.RolesList = res;
    });
  }

  submitted = false;
  createEditRole() {
    debugger;
    this.submitted = true;
    if (this.roleForm.valid) {
      let role: Roles = new Roles();
      role.rid =
        this.roleForm.get('rid')?.value == null ? 0 : this.roleEdit.rid;
      role.role = this.roleForm.get('role')?.value;
      console.log('role=', role);
      this.candidateService.AddUpdateRole(role).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.getRoles();
            this.onAdd();
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.roleForm.get(
                field.charAt(0).toLowerCase() + field.slice(1)
              );
              if (formControl) {
                formControl.setErrors({
                  serverError: validationErrors[field].join(' '),
                });
              }
            }
          }
        },
      });
    }
  }

  onAdd(): void {
    this.submitted = false;
    this.roleForm.reset();
    this.roleForm.markAsPristine();
    this.roleForm.markAsUntouched();
    this.roleForm.updateValueAndValidity();
  }

  deleteRole(roleId: number) {
    this.candidateService.confirmDelete().then((result: any) => {
      if (result.isConfirmed) {
        this.candidateService.DeleteRole(roleId).subscribe({
          next: (res: any) => {
            // Handle successful response
            console.log('Role deleted successfully:', res);
            this.getRoles();
          },
          error: (err: any) => {
            // Handle error response
            // console.error('Error occurred:', err);
            if (err.status === 500) {
              // Extract error message from the response
              Swal.fire({
                title: 'Can Not Delete!',
                text: 'This role is used as foreign key :)',
                icon: 'error',
                timer: 3000, // Auto-close after 3 seconds
                timerProgressBar: true,
              });
            } else {
              Swal.fire({
                title: 'error',
                text: 'Somthing is wring :)',
                icon: 'error',
                timer: 2000, // Auto-close after 2 seconds
                timerProgressBar: true,
              });
            }
          },
        });
      }
    });
  }
  shouldShowError(controlName: string): boolean {
    const control = this.roleForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
}
