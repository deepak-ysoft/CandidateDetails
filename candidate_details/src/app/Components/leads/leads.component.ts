import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonServiceService } from '../../Services/common-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';
import { Leads } from '../../Models/leads.model';
import { AddLeadsComponent } from '../add-leads/add-leads.component';
import { LeadsService } from '../../Services/leads.service';
import { Candidate } from '../../Models/candidate.model';
import { CandidateService } from '../../Services/candidate.service';

@Component({
  selector: 'app-leads',
  imports: [FormsModule, CommonModule, AddLeadsComponent, MatTooltipModule],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.css',
})
export class LeadsComponent {
  @ViewChild('addLeads', { static: false }) addLeads!: ElementRef;
  @ViewChild('LeadsDetails', { static: false })
  authService = inject(AuthService);
  servise = inject(CandidateService);
  router = inject(Router);
  userRole: string | null = null;
  LeadsDetails!: ElementRef;
  LeadsForDetails!: Leads;
  clickedLeads = false;
  clickedLeadsForEdit!: Leads;
  LeadsList: Leads[] = [];
  PageNumber: number = 1;
  pageSize: number = 10;
  searchTerms: string = '';
  searchTerm: string = '';
  heading = 'text-denger';
  commonService = inject(CommonServiceService);
  LeadsForm?: any;
  totalpages = 0;
  totalLeads = 0;
  currentPage = 1;
  LeadsData: any;
  closeResult = '';
  SearchField = '';
  firstLeadsOfPage = 1;
  lastLeadsOfPage = 10;
  excelFileUpload: File | null = null;
  LeadsModalHeader = 'Add Leads';

  constructor(
    private LeadsService: LeadsService,
    private modalService: NgbModal
  ) {
    this.userRole = this.authService.getRole();
    this.clickedLeads = false;
  }

  ngOnInit(): void {
    debugger;
    if (this.userRole === 'Employee') {
      this.router.navigateByUrl('/calendar');
    }

    this.LeadsService.LeadsList$.subscribe((Leads) => {
      this.LeadsList = Leads;
      console.log('LeadsList:', this.LeadsList);
    });

    this.LeadsService.totalLeads$.subscribe((total) => {
      this.totalLeads = total;
    });

    this.LeadsService.totalPages$.subscribe((pages) => {
      this.totalpages = pages;
    });

    this.LeadsService.getLeads(); // Trigger data fetch
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' })
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
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      this.excelFileUpload = file;
    }

    if (!this.excelFileUpload) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.excelFileUpload);

    this.LeadsService.UploadExcel(formData).subscribe((res: any) => {
      if (res.success) {
        this.LeadsService.getLeads(); // Trigger data fetch
        Swal.fire({
          title: 'Done! 🎉',
          text: 'Excel file successfully uploaded.',
          icon: 'success',
          timer: 2000, // Auto-close after 2 seconds
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          title: 'Cancelled! ❌',
          text: 'Something went wrong!',
          icon: 'error',
          timer: 3000, // Auto-close after 3 seconds
          timerProgressBar: true,
        });
      }

      // Reset file input after processing
      fileInput.value = ''; // This resets the file input field
    });
  }

  clickToSortLeads(
    PageNumber: number,
    pageSize: number,
    SearchField: string,
    SearchValue: string
  ): void {
    // Update class variables
    this.PageNumber = PageNumber;
    this.pageSize = pageSize;
    this.searchTerm = SearchValue;
    this.SearchField = SearchField;

    // Fetch Leads
    this.LeadsService.getLeads(
      this.PageNumber,
      this.pageSize,
      this.SearchField,
      this.searchTerm
    );
  }

  onSearchFieldChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.SearchField = selectedValue;
  }

  clickToSearchLeads(): void {
    // Update class variables
    this.searchTerm = this.searchTerms;

    // Fetch Leads
    this.LeadsService.getLeads(
      this.PageNumber,
      this.pageSize,
      this.SearchField,
      this.searchTerm
    );
  }

  addClicked = false;
  openAccLeadsModel() {
    this.addClicked = true;
    this.LeadsModalHeader = 'Add Leads';
    setTimeout(() => {
      this.addClicked = false;
    }, 0);
    this.open(this.addLeads);
    this.LeadsService.triggerResetForm();
  }

  EditLeads(Leads: Leads) {
    this.clickedLeadsForEdit = Leads; // Set the selected Leads
    this.LeadsModalHeader = 'Edit Leads';
    // Open the modal after data binding
    this.open(this.addLeads);
  }

  ShowLeadsDetails(Leads: Leads) {
    this.clickedLeads = true;
    this.LeadsForDetails = Leads;
  }

  deleteLeads(id: number) {
    this.servise.confirmDelete().then((result: any) => {
      if (result.isConfirmed) {
        this.LeadsService.deleteLeads(id).subscribe((res: any) => {
          if (res.success) {
            this.clickToSearchLeads();
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

    this.clickToSearchLeads(); // Call your function to load data based on the new page size
  }

  loadPage(page: any): void {
    if (page < 1 || page > this.totalpages || page === this.currentPage) {
      return; // Prevent navigation to invalid pages or same page
    }
    this.currentPage = page; // Update current page
    this.LeadsService.getLeads(
      this.currentPage, // Use updated currentPage
      this.pageSize,
      this.searchTerm,
      this.SearchField
    );

    this.lastLeadsOfPage = this.currentPage * 15;

    this.firstLeadsOfPage = this.lastLeadsOfPage - 14;
    if (this.lastLeadsOfPage > this.totalLeads) {
      this.lastLeadsOfPage = this.totalLeads;
    }
  }

  /**
   * Maps MIME types to file extensions.
   */
  private getFileExtensionFromMimeType(mimeType: string): string {
    const mimeTypeToExtensionMap: { [key: string]: string } = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'text/plain': '.txt',
    };

    // Default to ".bin" for unknown MIME types
    return mimeTypeToExtensionMap[mimeType] || '.bin';
  }

  prepareLinkedInUrl(url: string | undefined): string {
    // If url is undefined or empty, return a default URL
    if (!url) {
      return 'https://www.linkedin.com';
    }

    // If the URL doesn't start with 'http' or 'https', prepend 'https://'
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }

    return url;
  }
}
