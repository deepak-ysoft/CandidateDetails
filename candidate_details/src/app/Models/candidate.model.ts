

export class Candidate {
  id: number = 0;
  date: Date = new Date();
  name: string = '';
  contact_No: string = '';
  linkedin_Profile?: string;
  email_ID: string = '';
  roles: string = '';
  experience: string = '';
  skills: string = '';
  ctc: number = 0;
  etc: number = 0;
  notice_Period: string = '';
  current_Location: string = '';
  prefer_Location: string = '';
  reason_For_Job_Change: string = '';
  schedule_Interview?: Date;
  schedule_Interview_status?: string;
  comments: string = '';
  cvPath: string = '';
  cv?: File;
}
