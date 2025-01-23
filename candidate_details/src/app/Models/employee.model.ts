export class Employee {
  empId: number = 0;
  empName: string = '';
  empEmail: string = '';
  empPassword: string = '';
  empNumber: string = '';
  empDateOfBirth?: Date;
  empGender: string = '';
  empJobTitle: string = '';
  empDepartment: string = '';
  empExperience: string = '';
  empDateofJoining?: Date;
  empAddress: string = '';
  imagePath?: string;
  photo?: File; // Using File for handling file uploads
}
