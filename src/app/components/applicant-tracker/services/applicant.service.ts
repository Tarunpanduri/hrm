import { Injectable } from '@angular/core';
import { Database, ref, get, set, update, remove} from '@angular/fire/database';
import { Applicant } from '../models/applicant';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  constructor(private db: Database) {}

  async addApplicant(applicant: Applicant) {
    const applicantsRef = ref(this.db, 'applicants');
    const snapshot = await get(applicantsRef);

    let nextKey = 'applicant1';

    if (snapshot.exists()) {
      const data = snapshot.val();
      const keys = Object.keys(data);
      const nums = keys
        .map(k => k.match(/^applicant(\d+)$/))
        .filter(Boolean)
        .map(m => parseInt(m![1], 10));
      const max = Math.max(...nums, 0);
      nextKey = `applicant${max + 1}`;
    }

    const applicantRef = ref(this.db, `applicants/${nextKey}`);
    return set(applicantRef, { ...applicant, id: nextKey });
  }

  async getApplicants(): Promise<Applicant[]> {
    const snapshot = await get(ref(this.db, 'applicants'));
    return snapshot.exists() ? Object.values(snapshot.val()) as Applicant[] : [];
  }

  async removeApplicant(email: string) {
    const applicantsSnap = await get(ref(this.db, 'applicants'));
    if (applicantsSnap.exists()) {
      const applicants = applicantsSnap.val();
      for (const [key, value] of Object.entries<any>(applicants)) {
        if (value.email === email) {
          await remove(ref(this.db, `applicants/${key}`));
          break;
        }
      }
    }
  }

  async updateStatus(email: string, newStatus: string) {
    const applicantsSnap = await get(ref(this.db, 'applicants'));
    if (applicantsSnap.exists()) {
      const applicants = applicantsSnap.val();
      for (const [key, value] of Object.entries<any>(applicants)) {
        if (value.email === email) {
          await update(ref(this.db, `applicants/${key}`), { status: newStatus });
          break;
        }
      }
    }
  }

  async saveEmployee(empId: string, data: any) {
    await set(ref(this.db, `employees/${empId}`), data);
  }
}
