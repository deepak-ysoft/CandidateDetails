export class Calendar {
  calId: number;
  subject: string;
  description: string;
  startDate?: Date;
  endDate?: Date;

  constructor() {
    this.calId = 0;
    this.subject = '';
    this.description = '';
  }
}
