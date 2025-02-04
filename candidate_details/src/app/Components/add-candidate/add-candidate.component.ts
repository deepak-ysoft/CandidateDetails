import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CandidateService } from '../../Services/candidate.service';
import { CommonServiceService } from '../../Services/common-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-candidate',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-candidate.component.html',
  styleUrl: './add-candidate.component.css',
})
export class AddCandidateComponent implements OnInit {
  candidateForm: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  userRole: string | null = null;
  submitted = false;
  selectedFile: any = null;
  candidateServices = inject(CandidateService);
  commonService = inject(CommonServiceService);
  @Input() candidateEdit?: any;
  @Input() addClicked?: any;
  isclick = output<boolean>();
  selectedRoleId = '';
  
  ngOnInit(): void {
    if (this.userRole === 'Employee') {
      this.router.navigateByUrl('/calendar');
    }
    this.candidateServices.resetForm$.subscribe(() => this.onAdd());
    if (this.candidateEdit?.id && !this.addClicked) {
      this.candidateForm.patchValue({
        id: this.candidateEdit?.id,
        date: this.candidateEdit.date,
        name: this.candidateEdit.name,
        contact_No: this.candidateEdit.contact_No,
        linkedin_Profile: this.candidateEdit.linkedin_Profile,
        email_ID: this.candidateEdit.email_ID,
        roles: this.candidateEdit.roles,
        experience: this.candidateEdit.experience,
        skills: this.candidateEdit.skills,
        ctc: this.candidateEdit.ctc,
        etc: this.candidateEdit.etc,
        notice_Period: this.candidateEdit.notice_Period,
        current_Location: this.candidateEdit.current_Location,
        prefer_Location: this.candidateEdit.prefer_Location,
        reason_For_Job_Change: this.candidateEdit.reason_For_Job_Change,
        schedule_Interview: this.candidateEdit.schedule_Interview,
        schedule_Interview_status: this.candidateEdit.schedule_Interview_status,
        comments: this.candidateEdit.comments,
        cv: this.candidateEdit.cvPath,
      });
    } else {
      this.onAdd();
    }
  }
  constructor(private fb: FormBuilder, private modalService: NgbModal) {
    this.userRole = this.authService.getRole();
    this.submitted = false;
    this.candidateForm = this.fb.group({
      id: [null],
      date: ['', Validators.required],
      name: ['', Validators.required],
      contact_No: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?:\+?[0-9 ]+)?$/),
          Validators.minLength(10),
          Validators.maxLength(14),
        ],
      ],
      linkedin_Profile: [''],
      email_ID: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      roles: [],
      experience: ['', Validators.required],
      skills: ['', Validators.required],
      ctc: ['', Validators.required],
      etc: ['', Validators.required],
      notice_Period: ['', Validators.required],
      current_Location: ['', Validators.required],
      prefer_Location: ['', Validators.required],
      reason_For_Job_Change: ['', Validators.required],
      schedule_Interview: [''],
      schedule_Interview_status: [''],
      comments: ['', Validators.required],
      cv: [],
    });
    this.commonService.addCandidateForm(this.candidateForm);
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
    return this.candidateForm.controls;
  }
  // when user click on change password
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
    }
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (validTypes.includes(this.selectedFile.type)) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.candidateServices.uploadCV(formData).subscribe((res: any) => {
        if (res.success) {
          this.candidateForm.patchValue({
            name: res.data.name,
            email_ID: res.data.email,
            contact_No: res.data.phone,
            skills: res.data.skills,
          });
        }
      });
    }
  }


  onRoleChange(event: Event): void {
    this.selectedRoleId = (event.target as HTMLSelectElement).value;
  }

  onAdd(): void {
    this.submitted = false;
    this.candidateForm.reset();
    this.candidateForm.markAsPristine();
    this.candidateForm.markAsUntouched();
    this.candidateForm.updateValueAndValidity();
    this.submitted = false;
  }
  onSubmit() {
    this.submitted = true;
    if (this.candidateForm.valid) {
      const formData = new FormData();
      formData.append(
        'id',
        this.candidateForm.get('id')?.value ||
          this.candidateEdit?.id != undefined ||
          this.candidateEdit?.id != null
          ? this.candidateEdit.id
          : 0
      );
      formData.append('date', this.candidateForm.get('date')?.value || '');
      formData.append('name', this.candidateForm.get('name')?.value || '');
      formData.append(
        'contact_No',
        this.candidateForm.get('contact_No')?.value || ''
      );
      formData.append(
        'linkedin_Profile',
        this.candidateForm.get('linkedin_Profile')?.value || ''
      );
      formData.append(
        'email_ID',
        this.candidateForm.get('email_ID')?.value || ''
      );
      formData.append(
        'roles',
        this.selectedRoleId || this.candidateForm.get('roles')?.value || ''
      );
      formData.append(
        'experience',
        this.candidateForm.get('experience')?.value || ''
      );
      formData.append('skills', this.candidateForm.get('skills')?.value || '');
      formData.append('ctc', this.candidateForm.get('ctc')?.value || '');
      formData.append('etc', this.candidateForm.get('etc')?.value || '');
      formData.append(
        'notice_Period',
        this.candidateForm.get('notice_Period')?.value || ''
      );
      formData.append(
        'current_Location',
        this.candidateForm.get('current_Location')?.value || ''
      );
      formData.append(
        'prefer_Location',
        this.candidateForm.get('prefer_Location')?.value || ''
      );
      formData.append(
        'reason_For_Job_Change',
        this.candidateForm.get('reason_For_Job_Change')?.value || ''
      );
      formData.append(
        'schedule_Interview',
        this.candidateForm.get('schedule_Interview')?.value || ''
      );
      formData.append(
        'schedule_Interview_status',
        this.candidateForm.get('schedule_Interview_status')?.value || ''
      );
      formData.append(
        'comments',
        this.candidateForm.get('comments')?.value || ''
      );

      if (this.selectedFile) {
        formData.append('cv', this.selectedFile, this.selectedFile.name);
      }
      this.candidateServices.AddEditCandidate(formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.candidateForm.reset();
            this.candidateForm.markAsPristine();
            this.candidateForm.markAsUntouched();
            this.candidateServices.getCandidates();
            this.submitted = false;
            this.isclick.emit(true);
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.candidateForm.get(
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
    const control = this.candidateForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
}
