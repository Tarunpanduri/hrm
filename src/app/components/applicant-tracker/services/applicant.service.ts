import { Injectable } from '@angular/core';
import { Database,getDatabase, ref, set, get, child, update, remove } from '@angular/fire/database';
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

    return set(ref(this.db, `applicants/${nextKey}`), { ...applicant, id: nextKey });
  }

  async getApplicants(): Promise<Applicant[]> {
    const snapshot = await get(child(ref(this.db), 'applicants'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Applicant[];
    }
    return [];
  }

  async removeApplicant(email: string) {
    const snapshot = await get(ref(this.db, 'applicants'));
    if (snapshot.exists()) {
      const applicants = snapshot.val();
      for (const [key, value] of Object.entries<any>(applicants)) {
        if (value.email === email) {
          await remove(ref(this.db, `applicants/${key}`));
          break;
        }
      }
    }
  }

  async updateStatus(email: string, newStatus: string) {
    const snapshot = await get(ref(this.db, 'applicants'));
    if (snapshot.exists()) {
      const applicants = snapshot.val();
      for (const [key, value] of Object.entries<any>(applicants)) {
        if (value.email === email) {
          await update(ref(this.db, `applicants/${key}`), { status: newStatus });
          break;
        }
      }
    }
  }

  async saveEmployee(empId: string, data: any) {
    const db = getDatabase();
    await set(ref(db, 'employees/' + empId), data);
  }
}
