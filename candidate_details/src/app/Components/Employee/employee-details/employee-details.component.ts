import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Employee } from '../../../Models/employee.model';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeLeave } from '../../../Models/employeeLeave.model';
import { EmployeeService } from '../../../Services/employee.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CandidateService } from '../../../Services/candidate.service';
import { environment } from '../../../../environments/environment';
import { EmpLocalStorService } from '../../../Services/emp-local-stor.service';
import { AuthService } from '../../../Services/auth.service';
import { EmployeeAssetsService } from '../../../Services/employee-assets.service';
import { EmployeeAssets } from '../../../Models/employeeAssets.model';

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
  private baseUrl = environment.apiURL;
  empImage: string;
  private modalRef: NgbModalRef | null = null; // Store the modal reference
  @ViewChild('leaveModal', { static: false }) leaveModal!: ElementRef;
  @ViewChild('AssetsModal', { static: false }) AssetsModal!: ElementRef;
  @ViewChild('employeeModal', { static: false }) employeeModal!: ElementRef;
  defaultImage: string = 'assets/Image/Default.jpg'; // Path to default image
  selectedImage: string | null = null; // For showing the selected image
  selectedFile: any = null;
  LeaveModalHeader = 'Add Leave';
  AssetModalHeader = 'Add Asset';
  closeResult = '';
  AssetsForm: FormGroup;
  leaveForm: FormGroup;
  employeeForm: FormGroup;
  changePassForm: FormGroup;
  employee: Employee = new Employee();
  empLeaveList: EmployeeLeave[] = [];
  employeeAssets: EmployeeAssets[] = [];
  empAsset: EmployeeAssets = new EmployeeAssets();
  empLeave: EmployeeLeave = new EmployeeLeave();
  empLeaveEdit: EmployeeLeave = new EmployeeLeave();
  employeeAssetsService = inject(EmployeeAssetsService);
  localStorageService = inject(EmpLocalStorService);
  EmployeeService = inject(EmployeeService);
  candidateService = inject(CandidateService);
  empLocalstorageService = inject(EmpLocalStorService);
  authService = inject(AuthService);
  userRole: string | null = null;
  loggedEmp: any;
  PageNumber: number = 1;
  currentPage = 1;
  totalpages = 0;
  totalEmpLeave = 0;
  firstCandidateOfPage = 1;
  lastCandidateOfPage = 10;
  submitted = false;
  currentAge: number = 0;
  show = false;
  showNewPass = false;
  showConPassword = false;
  isReqLeave = true;
  reqLeave: EmployeeLeave[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private route: ActivatedRoute
  ) {
    this.userRole = this.authService.getRole();
    this.empImage = `${this.baseUrl}` + `uploads/images/employee/`;
    this.getCurrentEmpData();

    this.employeeForm = this.EmployeeService.createEmployeeForm();
    this.changePassForm = this.fb.group(
      {
        empId: [0],
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        newCPassword: ['', [Validators.required]],
      },
      { validator: passwordMatchValidator() }
    );
    this.leaveForm = this.fb.group(
      {
        leaveId: [0],
        leaveFor: ['', [Validators.required]],
        leaveType: [''],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        empId: [0],
      },
      { validators: [this.dateRangeValidator] }
    );
    this.AssetsForm = this.fb.group(
      {
        assetId: [0],
        assetName: ['', [Validators.required]],
        empId: [0],
      },
      { validators: [this.dateRangeValidator] }
    );
  }

  getCurrentEmpData() {
    this.empLocalstorageService.emp$.subscribe((emp) => {
      this.loggedEmp = emp;
    });
  }

  ngOnInit(): void {
    this.show = false;
    this.showNewPass = false;
    this.showConPassword = false;
    this.isReqLeave = false;

    this.changePassForm.reset();
    this.changePassForm.markAsPristine(); // Reset validation state
    this.changePassForm.markAsUntouched(); // Remove touched status
    this.submitted = false;

    this.route.queryParams.subscribe((params: any) => {
      debugger;
      console.log('Employee ID:', params['empId']);
      this.getEmployeeById(params['empId']); // Reload employee details when query param changes
      this.EmployeeService.GetLeave(params['empId']);
    });

    // const state = window.history.state as { empId: number };
    // if (state && state.empId) {
    //   this.getEmployeeById(state.empId);
    this.calculateAge(); // Calculate age after assigning employee details
    //}
    this.EmployeeService.empLeaveRequestList$.subscribe((empLeave) => {
      this.reqLeave = empLeave;
    });

    this.EmployeeService.empLeaveList$.subscribe((empLeave) => {
      this.empLeaveList = empLeave;
    });

    this.EmployeeService.totalempLeave$.subscribe((total) => {
      this.totalEmpLeave = total;
    });

    this.EmployeeService.totalPages$.subscribe((pages) => {
      this.totalpages = pages;
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Show the selected image
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  editEmployee(employee: Employee) {
    this.selectedImage = this.EmployeeService.editEmployee(
      this.employeeForm,
      employee
    );

    this.open(this.employeeModal);
  }

  getEmployeeById(empId: number) {
    this.EmployeeService.getEmployeeById(empId).subscribe((res: any) => {
      if (res.success) {
        this.employee = res.employee;
      }
    });
    this.GetEmployeeAssets(empId);
  }

  GetLeave() {
    this.EmployeeService.GetLeave(this.employee.empId);
    this.isReqLeave = false;
  }

  GetRequestLeave(empId: number) {
    this.hasLeave(this.employee.empId);
    if (this.isSame) {
      this.isReqLeave = true;
      this.empLeaveList = this.reqLeave.filter(
        (leave) => leave.empId === empId
      );
    }
  }

  isSame: any;
  hasLeave(empId: number): boolean {
    this.isSame = this.reqLeave.some((leave) => leave.empId === empId);
    return this.isSame;
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
    this.leaveForm.reset(); // Resets all controls to their initial state
    this.leaveForm.markAsPristine(); // Reset validation state
    this.leaveForm.markAsUntouched(); // Remove touched status
    this.submitted = false;
    this.open(this.leaveModal);
    this.LeaveModalHeader = 'Add Leave';
  }

  editLeave(leave: EmployeeLeave) {
    this.empLeaveEdit = leave;
    this.LeaveModalHeader = 'Edit Leave';
    this.leaveForm.patchValue({
      leaveId: leave.leaveId,
      leaveFor: leave.leaveFor,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      empId: leave.empId,
    });
    if (!this.isReqLeave) {
      this.open(this.leaveModal);
    } else {
      this.onSubmit();
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.leaveForm.valid) {
      if (this.leaveForm.get('leaveId')?.value == null) {
        this.leaveForm.get('leaveId')?.setValue(0);
      }
      this.leaveForm.get('empId')?.setValue(this.employee.empId);
      this.EmployeeService.addUpdateEmployeeLeave(
        this.leaveForm.value
      ).subscribe({
        next: (res: any) => {
          this.closeModal();
          this.leaveForm.reset();
          this.leaveForm.markAsPristine(); // Reset validation state
          this.leaveForm.markAsUntouched(); // Remove touched status
          this.submitted = false;

          this.isReqLeave = false;
          this.EmployeeService.GetLeave(this.employee.empId);
          if (res.success) {
            Swal.fire({
              title: 'Done! &#128522;',
              text: 'Request sent successfully :)',
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

  onChangePasswordSubmit() {
    this.submitted = true;
    if (this.changePassForm.valid) {
      this.changePassForm.get('empId')?.setValue(this.loggedEmp.employee.empId);
      this.EmployeeService.changePassword(this.changePassForm.value).subscribe({
        next: (res: any) => {
          if (res.success) {
            Swal.fire({
              title: 'Done! &#128522;',
              text: 'Password Changed.',
              icon: 'success',
              timer: 1000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
            this.changePassForm.reset();
            this.changePassForm.markAsPristine(); // Reset validation state
            this.changePassForm.markAsUntouched(); // Remove touched status
            this.submitted = false;
          } else {
            Swal.fire({
              title: 'Cancelled! &#128078;',
              text: 'Current Password is wrong :)',
              icon: 'error',
              timer: 2000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.changePassForm.get(
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

  onSubmitEmployee() {
    this.submitted = true;
    var formData = new FormData();

    if (this.selectedFile) {
      // Append the selected file
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    } else {
      // Create a File object for "Default.jpg"
      const defaultFile = new File([''], 'Default.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      formData.append('photo', defaultFile);
    }
    this.employeeForm.get('empPassword')?.setValue('Same@123');
    this.employeeForm.get('empPasswordConfirm')?.setValue('Same@123');
    formData.append(
      'empPassword',
      this.employeeForm.get('empPassword')?.value || ''
    );
    formData.append(
      'empPasswordConfirm',
      this.employeeForm.get('empPasswordConfirm')?.value || ''
    );
    if (this.employeeForm.valid) {
      formData.append('empId', this.employeeForm.get('empId')?.value || 0);
      formData.append('empName', this.employeeForm.get('empName')?.value || '');
      formData.append(
        'empEmail',
        this.employeeForm.get('empEmail')?.value || ''
      );

      formData.append(
        'empNumber',
        this.employeeForm.get('empNumber')?.value || ''
      );
      formData.append(
        'empDateOfBirth',
        this.employeeForm.get('empDateOfBirth')?.value || ''
      );
      formData.append(
        'empGender',
        this.employeeForm.get('empGender')?.value || ''
      );
      formData.append(
        'empJobTitle',
        this.employeeForm.get('empJobTitle')?.value || ''
      );
      formData.append(
        'empExperience',
        this.employeeForm.get('empExperience')?.value || ''
      );
      formData.append(
        'empDateofJoining',
        this.employeeForm.get('empDateofJoining')?.value || ''
      );
      formData.append(
        'empAddress',
        this.employeeForm.get('empAddress')?.value || ''
      );
      formData.append('roleId', this.employeeForm.get('roleId')?.value || '3');

      this.EmployeeService.updateEmployee(formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.employee = res.employee;
            this.localStorageService.setEmp(res);
            this.closeModal();
            this.employeeForm.reset();
            this.employeeForm.markAsPristine(); // Reset validation state
            this.employeeForm.markAsUntouched(); // Remove touched status
            this.submitted = false;
            Swal.fire({
              title: 'Done! &#128522;',
              text: 'Employee Updated.',
              icon: 'success',
              timer: 1000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          } else {
            if (res.message == 'Duplicate Email') {
              Swal.fire({
                title: 'Duplicate Email! &#128078;',
                text: 'Email already exist :)',
                icon: 'error',
                timer: 2000, // Auto-close after 2 seconds
                timerProgressBar: true,
              });
            } else {
              Swal.fire({
                title: 'Cancelled! &#128078;',
                text: 'Something is wrong :)',
                icon: 'error',
                timer: 2000, // Auto-close after 2 seconds
                timerProgressBar: true,
              });
            }
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.employeeForm.get(
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
        this.EmployeeService.deleteEmployeeLeave(leaveId).subscribe(
          (res: any) => {
            if (res.success) {
              this.EmployeeService.GetLeave(this.employee.empId); // Trigger data fetch
            } else {
              Swal.fire({
                title: 'Cancelled! &#128078;',
                text: 'Something is wrong :)',
                icon: 'error',
                timer: 2000, // Auto-close after 2 seconds
                timerProgressBar: true,
              });
            }
          }
        );
      }
    });
  }

  open(content: any) {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
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

  shouldShowAssetsError(controlName: string): boolean {
    const control = this.AssetsForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }

  // show server side error if client-side not working
  shouldShowChangePassError(controlName: string): boolean {
    const control = this.changePassForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }

  Show() {
    this.show = !this.show;
  }
  ShowNewPass() {
    this.showNewPass = !this.showNewPass;
  }
  ShowConPassword() {
    this.showConPassword = !this.showConPassword;
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

  //  Employee Assets

  GetEmployeeAssets(empId: number) {
    this.employeeAssetsService
      .getEmployeeAssets(empId)
      .subscribe((res: any) => {
        if (res.success) {
          this.employeeAssets = res.employeeAssets;
        }
      });
  }

  openAssetsModal() {
    this.AssetsForm.reset(); // Resets all controls to their initial state
    this.AssetsForm.markAsPristine(); // Reset validation state
    this.AssetsForm.markAsUntouched(); // Remove touched status
    this.submitted = false;
    this.open(this.AssetsModal);
    this.AssetModalHeader = 'Add Asset';
  }

  editAsset(asset: EmployeeAssets) {
    this.AssetModalHeader = 'Edit Asset';
    this.AssetsForm.patchValue({
      assetId: asset.assetId,
      assetName: asset.assetName,
      empId: asset.empId,
    });

    this.open(this.AssetsModal);
  }

  onSubmitAssets() {
    this.submitted = true;
    if (this.AssetsForm.valid) {
      if (this.AssetsForm.get('assetId')?.value == null) {
        this.AssetsForm.get('assetId')?.setValue(0);
      }
      this.AssetsForm.get('empId')?.setValue(this.employee.empId);
      this.employeeAssetsService
        .addUpdateEmployeeAssets(this.AssetsForm.value)
        .subscribe({
          next: (res: any) => {
            this.closeModal();
            this.AssetsForm.reset();
            this.AssetsForm.markAsPristine(); // Reset validation state
            this.AssetsForm.markAsUntouched(); // Remove touched status
            this.submitted = false;
            this.GetEmployeeAssets(this.employee.empId);
            if (res.success) {
              Swal.fire({
                title: 'Done! &#128522;',
                text: 'Added/Updated successfully :)',
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
                const formControl = this.AssetsForm.get(
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

  DeleteAsset(assetId: number) {
    this.candidateService.confirmDelete().then((result: any) => {
      if (result.isConfirmed) {
        this.employeeAssetsService
          .deleteEmployeeAssets(assetId)
          .subscribe((res: any) => {
            if (res.success) {
              this.GetEmployeeAssets(this.employee.empId); // Trigger data fetch
            } else {
              Swal.fire({
                title: 'Cancelled! &#128078;',
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
}
// copmare password validation
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('newPassword')?.value;
    const cPassword = control.get('newCPassword')?.value;

    return password === cPassword ? null : { mismatch: true };
  };
}
