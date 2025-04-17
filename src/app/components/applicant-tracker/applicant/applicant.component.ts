import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import { ApplicantService } from '../services/applicant.service';
import { Applicant } from '../models/applicant';

@Component({
  selector: 'app-applicant',
  standalone: false,
  templateUrl: './applicant.component.html',
  styleUrls: ['./applicant.component.css']
})
export class ApplicantComponent implements OnInit {
  applicants: Applicant[] = [];
  showModal = false;
  selectedApplicant: any = null;
  showChangeStatus: any = null;

  @ViewChildren('menuButton') menuButtons!: QueryList<ElementRef>;
  @ViewChildren('popup') popups!: QueryList<ElementRef>;

  newApplicant: Applicant = {
    name: '',
    email: '',
    location: '',
    role: '',
    department: '',
    status: 'Applied'
  };

  constructor(
    private applicantService: ApplicantService,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadApplicants();
  }

  async loadApplicants() {
    this.applicants = await this.applicantService.getApplicants();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async submitApplicant() {
    await this.applicantService.addApplicant(this.newApplicant);
    this.closeModal();
    this.newApplicant = {
      name: '',
      email: '',
      location: '',
      role: '',
      department: '',
      status: 'Applied'
    };
    this.loadApplicants();
  }

  filterByStatus(status: string): Applicant[] {
    return this.applicants.filter(app => app.status === status);
  }

  toggleOptions(app: Applicant) {
    this.selectedApplicant = this.selectedApplicant === app ? null : app;
    this.showChangeStatus = null;
  }

  async removeApplicant(app: Applicant) {
    await this.applicantService.removeApplicant(app.email);
    this.selectedApplicant = null;
    this.loadApplicants();
  }

  async changeStatus(app: Applicant, newStatus: string) {
    await this.applicantService.updateStatus(app.email, newStatus);
    this.selectedApplicant = null;
    this.showChangeStatus = null;
    this.loadApplicants();
  }
  
  onboardModal = false;
onboardingData: any = {
  department: '',
  educational_details: '',
  email: '',
  emp_id: '',
  joiningDate: '',
  dateofBirth: '',
  location: '',
  name: '',
  profileImg: '',
  bloodGroup:'',
  personalEmail: '',
  role: '',
  status: 'Hired',
  CTC: ''
};

openOnboardForm(app: Applicant) {
  this.onboardModal = true;
  this.onboardingData = {
    department: app.department || '',
    educational_details: '',
    email: '',
    emp_id: 'EMP' + Math.floor(Math.random() * 10000), // or use a generator
    joiningDate: '',
    location: app.location || '',
    personal_mail: app.email,
    name: app.name,
    dateofBirth: '',
    profileImg: '',
    bloodGroup:'',
    role: app.role,
    status: 'Active',
    CTC: ''
  };
}

closeOnboardForm() {
  this.onboardModal = false;
}

async submitOnboarding() {
  const empId = this.onboardingData.emp_id;
  await this.applicantService.saveEmployee(empId, this.onboardingData);
  this.onboardModal = false;
  this.onboardingData = {};
}


  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const clickedInsideComponent = this.eRef.nativeElement.contains(event.target);
    const clickedMenuBtn = (event.target as HTMLElement)?.closest('.menu');
    const clickedStatusPopup = (event.target as HTMLElement)?.closest('.status-popup');

    if (!clickedInsideComponent || (!clickedMenuBtn && !clickedStatusPopup)) {
      this.selectedApplicant = null;
      this.showChangeStatus = null;
    }
  }
}
