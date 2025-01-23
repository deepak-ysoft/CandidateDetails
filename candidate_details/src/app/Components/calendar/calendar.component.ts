import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular'; // Import the FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // FullCalendar plugins
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';
import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CalendarService } from '../../Services/calendar.service';
import { CandidateService } from '../../Services/candidate.service';
import Swal from 'sweetalert2';
import { CommonModule, DatePipe } from '@angular/common';
import { Calendar } from '../../Models/calendar.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule, ReactiveFormsModule, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent; // Access to the calendar instance
  @ViewChild('calendarModel', { static: false }) calendarModel!: ElementRef;
  @Input() customerId: any;
  modalPopupAndMsg = 'Add Event';
  fullcalendar: Calendar = new Calendar();
  editcalendarVar: Calendar = new Calendar();
  service = inject(CalendarService);
  candidateService = inject(CandidateService);
  submitted = false;
  closeResult = '';
  private baseUrl = environment.apiURL;
  isNgTemplateHide = false;
  showCalendar = true;
  isDetailClicked = false;
  isUsed = false;

  // for appointment address
  onSubmitForm: FormGroup = new FormGroup(
    {
      calId: new FormControl(0),
      subject: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    },
    { validators: [this.dateRangeValidator] }
  );
  @Input() set tabChange(tabId: string) {
    this.refreshCalendar(); // Call refresh when "Appointments" tab is active
  }
  // refresh calender
  refreshCalendar(): void {
    if (this.calendarComponent) {
      setTimeout(() => {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.updateSize();
        calendarApi.render();
      }, 0);
    }
  }

  // Define calendar options
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: this.fetchEvents.bind(this), // Load events via a function
    eventDrop: this.handleEventDrop.bind(this), // Handle event drop
    eventResize: this.handleEventResize.bind(this), // Handle event resize
    eventClick: this.handleEventClick.bind(this), // Handle event click
  };

  constructor(private http: HttpClient, private modalService: NgbModal) {
    this.fullcalendar = new Calendar();
    this.getEventList();
  }

  onAdd() {
    this.open(this.calendarModel);
    this.onSubmitForm.reset();
    this.modalPopupAndMsg = 'Add Event';
  }

  onSubmit() {
    debugger;
    this.submitted = true;
    // Submit if valid
    if (this.onSubmitForm.valid) {
      this.onSubmitForm.get('calId')?.value == null
        ? 0
        : this.editcalendarVar.calId;

      this.service.insertCalendar(this.onSubmitForm.value).subscribe({
        next: (res: any) => {
          if (res) {
            this.fullcalendar = new Calendar();
            this.isNgTemplateHide = true;
            this.getEventList(); // Refresh the lists after deletion
            this.updateCalendarOptions(); // Update the calendar options
            this.onSubmitForm.reset();
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Not Added.',
              icon: 'error',
              timer: 2000, // Auto close after 2000 milliseconds
              showConfirmButton: false,
            });
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.onSubmitForm.get(
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
  // server side validation show if client side validation not work
  shouldShowError(controlName: string): boolean {
    const control = this.onSubmitForm.get(controlName);
    return (
      (control?.invalid &&
        (control.touched || control.dirty || this.submitted)) ??
      false
    );
  }

  ngOnInit(): void {
    this.showCalendar = true;
    this.isDetailClicked = false;
    // load all event when page load

    this.updateCalendarOptions(); // Update the calendar options
  }

  // Method to fetch events from the backend
  fetchEvents(
    fetchInfo: any,
    successCallback: any,
    failureCallback: any
  ): void {
    this.http.get(`${this.baseUrl}Calendar/GetCalendar`).subscribe(
      (data: any) => {
        const events = data.map(
          (calendar: {
            calId: any;
            title: any;
            start: any;
            end: any;
            description: any;
          }) => ({
            id: calendar.calId,
            title: calendar.title,
            start: calendar.start,
            end: calendar.end,
            description: calendar.description,
          })
        );
        successCallback(events);
      },
      (error) => {
        // console.error('Error loading events', error);
        failureCallback(error);
      }
    );
  }

  // Handle event drop (move event)
  handleEventDrop(eventDropInfo: { event: any; revert: () => void }): void {
    const event = eventDropInfo.event;
    const eventId = event.id || Math.random().toString(36).substring(2, 9);
    const newStart = format(event.start, "yyyy-MM-dd'T'HH:mm:ssxxx");
    const newEnd = event.end
      ? format(event.end, "yyyy-MM-dd'T'HH:mm:ssxxx")
      : newStart;

    const payload = {
      id: eventId,
      newStart: newStart,
      newEnd: newEnd,
    };

    this.service.updateCalendar(eventId, newStart, newEnd).subscribe({
      next: (response) => {},
      error: (error) => {
        // console.error('Error updating event', error);
        eventDropInfo.revert(); // Revert the changes if failed
      },
      complete: () => {},
    });
  }

  // Handle event resize
  handleEventResize(eventResizeInfo: { event: any; revert: () => void }): void {
    const event = eventResizeInfo.event;
    const newStart = event.start.toISOString();
    const newEnd = event.end ? event.end.toISOString() : newStart;
    this.http
      .post(`${this.baseUrl}Calendar/UpdateCalendar`, {
        id: event.id,
        newStart,
        newEnd,
      })
      .subscribe(
        (response) => {},
        (error) => {
          // console.error('Error resizing event', error);
          eventResizeInfo.revert(); // Revert changes if failed
        }
      );
  }

  // Handle event click
  handleEventClick(clickInfo: { event: { id: any } }): void {
    const eventId = clickInfo.event.id;
    this.isDetailClicked = true;

    this.http
      .get(`${this.baseUrl}Calendar/GetCalendarDetails/${eventId}`)
      .subscribe(
        (data: any) => {
          // Show appointment details (can integrate with a modal)

          this.fullcalendar = data.data;
          this.isUsed = data.isUsed;

          this.modalPopupAndMsg = 'Event Details';
          this.open(this.calendarModel);
        },
        (error) => {
          ///console.error('Error fetching appointment details', error);
        }
      );
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

  // edit calendar
  editcalendar(calendar: Calendar) {
    this.editcalendarVar = calendar;
    this.onSubmitForm.patchValue({
      calId: calendar.calId,
      subject: calendar.subject,
      description: calendar.description,
      startDate: calendar.startDate,
      endDate: calendar.endDate,
      cancelAnimationFrameId: calendar.calId,
    });
    this.fullcalendar = calendar;
    this.modalPopupAndMsg = 'Edit Event';

    if (!this.isDetailClicked) {
      this.open(this.calendarModel);
    }
    this.isDetailClicked = false;
  }
  // Delete calendar by id
  DeleteCalendar(Id: any) {
    this.candidateService.confirmDelete().then((result) => {
      this.getEventList();
      if (result.isConfirmed) {
        this.service.successDelete(Id).subscribe({
          next: () => {
            this.getEventList(); // Refresh the lists after deletion
            this.updateCalendarOptions(); // Update the calendar options
          },
          error: (err) => {
            //console.error('Error deleting calendar:', err);
          },
        });
      }
    });
  }

  updateCalendarOptions() {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      editable: true,
      events: this.fetchEvents.bind(this), // Binding `fetchEvents` for event fetching
      eventDrop: this.handleEventDrop.bind(this), // Handle event drop
      eventResize: this.handleEventResize.bind(this), // Handle event resize
      eventClick: this.handleEventClick.bind(this), // Handle event click
    };
  }

  // Event list

  birthdayList: Calendar[] = [];
  holidayList: Calendar[] = [];
  getEventList() {
    this.service.getEventList().subscribe((res: any) => {
      if (res.bd) {
        this.birthdayList = res.bd;
        this.holidayList = res.hd;
      }
    });
  }

  ShowEventList() {
    this.showCalendar = false;
  }

  ShowCalendar() {
    this.showCalendar = true;
  }
}
