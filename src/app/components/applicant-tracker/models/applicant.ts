export interface Applicant {
    name: string;
    email: string;
    location: string;
    role: string;
    department: string;
    status: 'Applied' | 'Interviewed' | 'Made offer' | 'Hired';
  }
  