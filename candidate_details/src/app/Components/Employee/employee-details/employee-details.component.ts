import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  ɵclearResolutionOfComponentResourcesQueue,
} from '@angular/core';
import { Employee } from '../../../Models/employee.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeLeave } from '../../../Models/employeeLeave.model';
import { EmployeeService } from '../../../Services/employee.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CandidateService } from '../../../Services/candidate.service';

@Component({
  selector: 'app-employee-details',
  imports: [
    DatePipe,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css',
})
export class EmployeeDetailsComponent implements OnInit {
  private modalRef: NgbModalRef | null = null; // Store the modal reference
  @ViewChild('leaveModal', { static: false }) leaveModal!: ElementRef;
  LeaveModalHeader = 'Add Leave';
  closeResult = '';
  leaveForm: FormGroup;
  employee: Employee = new Employee();
  empLeaveList: EmployeeLeave[] = [];
  empLeave: EmployeeLeave = new EmployeeLeave();
  empLeaveEdit: EmployeeLeave = new EmployeeLeave();
  EmployeeService = inject(EmployeeService);
  candidateService = inject(CandidateService);
  PageNumber: number = 1;
  currentPage = 1;
  totalpages = 0;
  totalEmpLeave = 0;
  firstCandidateOfPage = 1;
  lastCandidateOfPage = 10;
  submitted = false;
  currentAge: number = 0;

  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.leaveForm = this.fb.group(
      {
        leaveId: [0],
        leaveFor: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        empId: [0],
      },
      { validators: [this.dateRangeValidator] }
    );
  }

  ngOnInit(): void {
    const state = window.history.state as { emp: Employee };
    if (state && state.emp) {
      this.employee = state.emp;
      this.calculateAge(); // Calculate age after assigning employee details
    }
    this.EmployeeService.empLeaveList$.subscribe((empLeave) => {
      this.empLeaveList = empLeave;
    });

    this.EmployeeService.totalempLeave$.subscribe((total) => {
      this.totalEmpLeave = total;
    });

    this.EmployeeService.totalPages$.subscribe((pages) => {
      this.totalpages = pages;
    });

    this.EmployeeService.GetLeave(this.employee.empId); // Trigger data fetch
  }

  // Method to calculate age
  calculateAge(): void {
    if (this.employee.empDateOfBirth) {
      const birthDate = new Date(this.employee.empDateOfBirth);
      const today = new Date();
      const diffInMilliseconds = today.getTime() - birthDate.getTime();
      const ageDate = new Date(diffInMilliseconds);

      this.currentAge = Math.abs(ageDate.getUTCFullYear() - 1970); // 1970 is the reference year
    } else {
      this.currentAge = 0; // Default age if no birth date is provided
    }
  }

  // Leave

  loadPage(page: any): void {
    if (page < 1 || page > this.totalpages || page === this.currentPage) {
      return; // Prevent navigation to invalid pages or same page
    }
    this.currentPage = page; // Update current page
    this.EmployeeService.GetLeave(
      this.employee.empId,
      this.currentPage // Use updated currentPage
    );

    this.lastCandidateOfPage = this.currentPage * 10;

    this.firstCandidateOfPage = this.lastCandidateOfPage - 9;
    if (this.lastCandidateOfPage > this.totalEmpLeave) {
      this.lastCandidateOfPage = this.totalEmpLeave;
    }
  }

  getDisplayedPages(): (number | string)[] {
    const maxVisiblePages = 3; // Number of pages to show before/after current page
    const pages: (number | string)[] = [];

    if (this.totalpages <= maxVisiblePages + 2) {
      // Show all pages if total pages fit within the limit
      for (let i = 1; i <= this.totalpages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Show ellipses before current page if necessary
      if (this.currentPage > maxVisiblePages) {
        pages.push('...');
      }

      // Add visible pages near the current page
      const startPage = Math.max(2, this.currentPage - 1); // Ensure no overlap with first page
      const endPage = Math.min(this.totalpages - 1, this.currentPage + 1); // Ensure no overlap with last page

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Show ellipses after current page if necessary
      if (this.currentPage < this.totalpages - maxVisiblePages + 1) {
        pages.push('...');
      }

      // Show last page
      pages.push(this.totalpages);
    }

    return pages;
  }

  // Leave

  openModal() {
    debugger;
    this.leaveForm.reset(); // Resets all controls to their initial state
    this.open(this.leaveModal);
    this.LeaveModalHeader = 'Add Leave';
  }

  editLeave(leave: EmployeeLeave) {
    this.empLeaveEdit = leave;
    this.LeaveModalHeader = 'Edit Leave';
    this.leaveForm.patchValue({
      leaveId: leave.leaveId,
      leaveFor: leave.leaveFor,
      startDate: leave.startDate,
      endDate: leave.endDate,
      empId: leave.empId,
    });
    this.open(this.leaveModal);
  }

  onSubmit() {
    this.submitted = true;
    debugger;
    if (this.leaveForm.valid) {
      if (this.leaveForm.get('leaveId')?.value == null) {
        this.leaveForm.get('leaveId')?.setValue(0);
      }
      this.leaveForm.get('empId')?.setValue(this.employee.empId);
      this.EmployeeService.addUpdateEmployeeLeave(
        this.leaveForm.value
      ).subscribe({
        next: (res: any) => {
          this.leaveForm.reset();
          this.closeModal();
          this.EmployeeService.GetLeave(this.employee.empId);
          if (res.success) {
            Swal.fire({
              title: 'Done!',
              text: 'Leave Added/Updated.',
              icon: 'success',
              timer: 1000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.leaveForm.get(
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

  DeleteLeave(leaveId: number) {
    this.candidateService.confirmDelete().then((result: any) => {
      if (result.isConfirmed) {
        this.EmployeeService.deleteEmployeeLeave(leaveId).subscribe((res: any) => {
          if (res.success) {
            this.EmployeeService.GetLeave(this.employee.empId); // Trigger data fetch
          } else {
            Swal.fire({
              title: 'Cancelled',
              text: 'Something is wrong :)',
              icon: 'error',
              timer: 2000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          }
        });
      }
    });
  }

  open(content: any) {
    debugger;
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    });

    this.modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        this.modalRef = null; // Reset modal reference
      },
      (reason) => {
        this.closeResult = `Dismissed`;
        this.modalRef = null; // Reset modal reference
      }
    );
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
      this.modalRef = null; // Reset modal reference
    }
  }

  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.leaveForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }

  // Custom validator to check startDate and endDate
  dateRangeValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { dateRangeInvalid: true }; // Return error if invalid
    }
    return null; // No error if valid
  }
}
