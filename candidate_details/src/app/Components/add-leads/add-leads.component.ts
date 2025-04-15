import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonServiceService } from '../../Services/common-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { LeadsService } from '../../Services/leads.service';

@Component({
  selector: 'app-add-leads',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-leads.component.html',
  styleUrl: './add-leads.component.css',
})
export class AddLeadsComponent implements OnInit {
  leadForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  userRole: string | null = null;
  submitted = false;
  selectedFile: any = null;
  leadServices = inject(LeadsService);
  commonService = inject(CommonServiceService);
  @Input() LeadEdit?: any;
  @Input() addClicked?: any;
  isclick = output<boolean>();
  selectedRoleId = '';

  ngOnInit(): void {
    if (this.userRole === 'Employee') {
      this.router.navigateByUrl('/calendar');
    }
    this.leadServices.resetForm$.subscribe(() => this.onAdd());

    debugger;
    if (this.LeadEdit?.leadsId && !this.addClicked) {
      this.leadForm.patchValue({
        leadsId: this.LeadEdit?.leadsId,
        dateTime: this.LeadEdit.dateTime,
        post: this.LeadEdit.post,
        number: this.LeadEdit.number,
        linkedInProfile: this.LeadEdit.linkedInProfile,
        email: this.LeadEdit.email,
        remarks: this.LeadEdit.remarks,
      });
    } else {
      this.onAdd();
    }
  }
  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.userRole = this.authService.getRole();
    this.submitted = false;
    this.leadForm = this.fb.group({
      leadsId: [null],
      dateTime: ['', Validators.required],
      post: ['', Validators.required],
      number: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?:\+?[0-9 ]+)?$/),
          Validators.minLength(10),
          Validators.maxLength(14),
        ],
      ],
      linkedInProfile: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      remarks: ['', Validators.required],
    });
    this.commonService.addLeadForm(this.leadForm);
  }

  closeResult = '';
  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed `;
        }
      );
  }

  get formControls() {
    return this.leadForm.controls;
  }

  onRoleChange(event: Event): void {
    this.selectedRoleId = (event.target as HTMLSelectElement).value;
  }

  onAdd(): void {
    this.submitted = false;
    this.leadForm.reset();
    this.leadForm.markAsPristine();
    this.leadForm.markAsUntouched();
    this.leadForm.updateValueAndValidity();
    this.submitted = false;
  }
  onSubmit() {
    this.submitted = true;
    if (this.leadForm.valid) {
      debugger;
      const formData = new FormData();
      let leadsIdValue =
        this.leadForm.get('leadsId')?.value ??
        (this.LeadEdit?.id != undefined && this.LeadEdit?.id != null
          ? this.LeadEdit.id
          : 0);

      formData.append('leadsId', leadsIdValue.toString());
      formData.append('dateTime', this.leadForm.get('dateTime')?.value || '');
      formData.append('post', this.leadForm.get('post')?.value || '');
      formData.append('number', this.leadForm.get('number')?.value || '');
      formData.append(
        'linkedInProfile',
        this.leadForm.get('linkedInProfile')?.value || ''
      );
      formData.append('email', this.leadForm.get('email')?.value || '');
      formData.append('remarks', this.leadForm.get('remarks')?.value || '');

      this.leadServices.AddEditLeads(formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.leadForm.reset();
            this.leadForm.markAsPristine();
            this.leadForm.markAsUntouched();
            this.leadServices.getLeads();
            this.submitted = false;
            this.isclick.emit(true);
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.leadForm.get(
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
  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.leadForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
}
