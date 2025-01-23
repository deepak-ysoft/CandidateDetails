import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-candidate-details',
  imports: [],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.css',
})
export class CandidateDetailsComponent {
  @Input() candidateDetail?: any;
  @Input() CandidateRole?: any;
}
