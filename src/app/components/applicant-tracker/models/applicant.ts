export interface Applicant {
  name: string;
  email: string;
  location: string;
  role: string;
  contactNumber:string,
  department: string;
  status: 'Applied' | 'Interviewed' | 'Made offer' | 'Hired';
}
