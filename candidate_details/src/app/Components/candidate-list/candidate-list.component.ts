import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CandidateService } from '../../Services/candidate.service';
import { Candidate } from '../../Models/candidate.model';
import { CommonModule } from '@angular/common';
import { AddCandidateComponent } from '../add-candidate/add-candidate.component';
import { FormsModule } from '@angular/forms';
import { CandidateDetailsComponent } from '../candidate-details/candidate-details.component';
import { CommonServiceService } from '../../Services/common-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-candidate-list',
  imports: [
    FormsModule,
    CommonModule,
    AddCandidateComponent,
    CandidateDetailsComponent,
    MatTooltipModule,
  ],
  templateUrl: './candidate-list.component.html',
  styleUrl: './candidate-list.component.css',
})
export class CandidateListComponent {
  @ViewChild('addCandidate', { static: false }) addCandidate!: ElementRef;
  @ViewChild('candidateDetails', { static: false })
  candidateDetails!: ElementRef;
  clickedCandidateForDetails!: Candidate;
  CandidateRole = '';
  clickedCandidateForEdit!: Candidate;
  candidateList: Candidate[] = [];
  isCVAvailable = false; // Set to true if CV exists for the candidate
  sortColumn: string = 'id';
  isSort = false;
  sortDirection: string = 'desc';
  PageNumber: number = 1;
  pageSize: number = 10;
  searchTerms: string = '';
  searchTerm: string = '';
  heading = 'text-denger';
  commonService = inject(CommonServiceService);
  candidateForm?: any;
  totalpages = 0;
  totalcandidates = 0;
  currentPage = 1;
  candidateData: any;
  closeResult = '';
  SearchField = '';
  firstCandidateOfPage = 1;
  lastCandidateOfPage = 10;
  excelFileUpload: File | null = null;
  CandidateModalHeader = 'Add Candidate';

  constructor(
    private candidateService: CandidateService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.candidateService.candidateList$.subscribe((candidates) => {
      this.candidateList = candidates;
    });

    this.candidateService.totalCandidates$.subscribe((total) => {
      this.totalcandidates = total;
    });

    this.candidateService.totalPages$.subscribe((pages) => {
      this.totalpages = pages;
    });

    this.candidateService.getCandidates(); // Trigger data fetch
  }

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
  onUploadExcelFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.excelFileUpload = file;
    }
    if (!this.excelFileUpload) {
      alert('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.excelFileUpload);
    this.candidateService.UploadExcel(formData).subscribe((res: any) => {
      if (res.success) {
        this.candidateService.getCandidates(); // Trigger data fetch
        Swal.fire({
          title: 'Done!',
          text: 'Excel file successfully uploaded.',
          icon: 'success',
          timer: 2000, // Auto-close after 2 seconds
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'Something is wrong :)',
          icon: 'error',
          timer: 3000, // Auto-close after 3 seconds
          timerProgressBar: true,
        });
      }
    });
  }

  clickToSortCandidate(
    PageNumber: number,
    pageSize: number,
    sortColumn: string,
    sortDirection: string,
    SearchField: string,
    SearchValue: string
  ): void {
    // Toggle sorting direction
    this.isSort = !this.isSort;
    sortDirection = this.isSort ? 'asc' : 'desc';

    // Update class variables
    this.PageNumber = PageNumber;
    this.pageSize = pageSize;
    this.searchTerm = SearchValue;
    this.SearchField = SearchField;
    this.sortColumn = sortColumn;
    this.sortDirection = sortDirection;

    // Fetch candidates
    this.candidateService.getCandidates(
      this.PageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.SearchField,
      this.searchTerm
    );
  }

  onSearchFieldChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.SearchField = selectedValue;
  }

  clickToSearchCandidate(): void {
    // Update class variables
    this.searchTerm = this.searchTerms;

    // Fetch candidates
    this.candidateService.getCandidates(
      this.PageNumber,
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.SearchField,
      this.searchTerm
    );
  }

  addClicked = false;
  openAccCandidateModel() {
    this.addClicked = true;
    this.CandidateModalHeader = 'Add Candidate';
    setTimeout(() => {
      this.addClicked = false;
    }, 0);
    this.open(this.addCandidate);
    this.candidateService.triggerResetForm();
  }

  EditCandidate(candidate: Candidate) {
    this.clickedCandidateForEdit = candidate; // Set the selected candidate
    this.CandidateModalHeader = 'Edit Candidate';
    // Open the modal after data binding
    this.open(this.addCandidate);
  }

  ShowCandidateDetails(candidate: Candidate) {
    this.candidateService.GetCandidate(candidate.id).subscribe((res: any) => {
      this.clickedCandidateForDetails = res.can;
      this.CandidateRole = res.role.role;
    });
    this.open(this.candidateDetails);
  }

  deleteCandidate(id: number) {
    this.candidateService.confirmDelete().then((result: any) => {
      if (result.isConfirmed) {
        this.candidateService.deleteCandidate(id).subscribe((res: any) => {
          if (res.success) {
            this.clickToSearchCandidate();
          }
        });
      }
    });
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

  onPageSizeChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.pageSize = +selectedValue; // Convert to number

    this.clickToSearchCandidate(); // Call your function to load data based on the new page size
  }

  loadPage(page: any): void {
    if (page < 1 || page > this.totalpages || page === this.currentPage) {
      return; // Prevent navigation to invalid pages or same page
    }
    this.currentPage = page; // Update current page
    this.candidateService.getCandidates(
      this.currentPage, // Use updated currentPage
      this.pageSize,
      this.sortColumn,
      this.sortDirection,
      this.searchTerm,
      this.SearchField
    );

    this.lastCandidateOfPage = this.currentPage * 10;

    this.firstCandidateOfPage = this.lastCandidateOfPage - 9;
    if (this.lastCandidateOfPage > this.totalcandidates) {
      this.lastCandidateOfPage = this.totalcandidates;
    }
  }

  downloadCV(candidateId: number, candidateName: string) {
    this.candidateService.downloadCV(candidateId).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Candidate_${candidateName}${candidateId}_CV.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        //   console.error(err);
        alert('Error downloading CV.');
      },
    });
  }
}
