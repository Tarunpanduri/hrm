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
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {
  Database,
  ref,
  get,
  update
} from '@angular/fire/database';

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

  hiredSearchTerm: string = '';
  filteredHiredApplicants: Applicant[] = [];

  @ViewChildren('menuButton') menuButtons!: QueryList<ElementRef>;
  @ViewChildren('popup') popups!: QueryList<ElementRef>;

  newApplicant: Applicant = {
    name: '',
    email: '',
    location: '',
    role: '',
    contactNumber:'',
    department: 'IT',
    status: 'Applied'
  };

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
    contactNumber:'',
    bloodGroup: '',
    panNumber:'',
    uan:'',
    pfNumber:'',
    personal_mail: '',
    role: '',
    status: 'Hired',
    CTC: '',
    password: ''
  };

  constructor(
    private applicantService: ApplicantService,
    private eRef: ElementRef,
    private auth: Auth,
    private db: Database // ✅ Updated to use modular Database
  ) {}

  ngOnInit() {
    this.loadApplicants();
  }

  async loadApplicants() {
    this.applicants = await this.applicantService.getApplicants();
    this.filterHiredApplicants();
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  filterHiredApplicants() {
    if (!this.hiredSearchTerm) {
      this.filteredHiredApplicants = this.filterByStatus('Hired');
    } else {
      const searchTerm = this.hiredSearchTerm.toLowerCase();
      this.filteredHiredApplicants = this.filterByStatus('Hired').filter(app =>
        app.name.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm)
      );
    }
  }

  async submitApplicant() {
    await this.applicantService.addApplicant(this.newApplicant);
    this.closeModal();
    this.newApplicant = {
      name: '',
      email: '',
      location: '',
      role: '',
      contactNumber:'',
      department: 'IT',
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

  openOnboardForm(app: Applicant) {
    this.onboardModal = true;
    this.onboardingData = {
      department: app.department || '',
      educational_details: '',
      email: '',
      emp_id: 'CIS' + Math.floor(Math.random() * 10000),
      joiningDate: '',
      location: app.location || '',
      personal_mail: app.email,
      contactNumber:app.contactNumber,
      name: app.name,
      dateofBirth: '',
      profileImg: '',
      bloodGroup: '',
      panNumber:'',
      uan:'',
      pfNumber:'',
      role: app.role,
      status: 'Active',
      CTC: '',
      password: ''
    };
  }

  closeOnboardForm() {
    this.onboardModal = false;
  }

  async submitOnboarding() {
    try {
      await createUserWithEmailAndPassword(
        this.auth,
        this.onboardingData.email,
        this.onboardingData.password
      );

      const employeeData = { ...this.onboardingData };
      delete employeeData.password;

      await this.applicantService.saveEmployee(this.onboardingData.emp_id, employeeData);

      if (this.onboardingData.department) {
        const departmentsRef = ref(this.db, 'climit/departments');
        const snapshot = await get(departmentsRef);

        if (snapshot.exists()) {
          const departments = snapshot.val();

          for (const key in departments) {
            if (departments[key].name === this.onboardingData.department) {
              const currentCrew = parseInt(departments[key].crew || '0', 10);
              const deptRef = ref(this.db, `climit/departments/${key}`);
              await update(deptRef, { crew: currentCrew + 1 });
              break;
            }
          }
        }
      }

      this.onboardModal = false;
      this.onboardingData = {};
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const isAddApplicantButton = (event.target as HTMLElement).closest('.add-btn');

    if (isAddApplicantButton) return;

    const clickedInsideModal =
      (event.target as HTMLElement).closest('.modal-content') ||
      (event.target as HTMLElement).closest('.onboard-content');

    const clickedMenuBtn = (event.target as HTMLElement).closest('.menu');
    const clickedStatusPopup = (event.target as HTMLElement).closest('.status-popup');

    if (!clickedInsideModal && !clickedMenuBtn && !clickedStatusPopup) {
      this.showModal = false;
      this.onboardModal = false;
      this.selectedApplicant = null;
      this.showChangeStatus = null;
    }
  }
}
