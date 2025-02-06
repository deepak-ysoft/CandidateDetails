import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'candidate_details';
  constructor(private spinner: NgxSpinnerService) {}

  ngOnInit() {
    // Optional: Show spinner on app load
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 200); // Auto-hide after 2 sec
  }
}
