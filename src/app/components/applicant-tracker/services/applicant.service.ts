import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Applicant } from '../models/applicant';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  constructor(private db: AngularFireDatabase) {}

  async addApplicant(applicant: Applicant) {
    const applicantsRef = this.db.database.ref('applicants');

    const snapshot = await applicantsRef.get();
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

    return this.db.object(`applicants/${nextKey}`).set({ ...applicant, id: nextKey });
  }

  async getApplicants(): Promise<Applicant[]> {
    const snapshot = await this.db.database.ref('applicants').get();
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Applicant[];
    }
    return [];
  }

  async removeApplicant(email: string) {
    const ref = this.db.database.ref('applicants');
    const snapshot = await ref.get();
    if (snapshot.exists()) {
      const applicants = snapshot.val();
      for (const [key, value] of Object.entries<any>(applicants)) {
        if (value.email === email) {
          await this.db.database.ref(`applicants/${key}`).remove();
          break;
        }
      }
    }
  }

  async updateStatus(email: string, newStatus: string) {
    const ref = this.db.database.ref('applicants');
    const snapshot = await ref.get();
    if (snapshot.exists()) {
      const applicants = snapshot.val();
      for (const [key, value] of Object.entries<any>(applicants)) {
        if (value.email === email) {
          await this.db.database.ref(`applicants/${key}`).update({ status: newStatus });
          break;
        }
      }
    }
  }

  async saveEmployee(empId: string, data: any) {
    await this.db.database.ref(`employees/${empId}`).set(data);
  }
  
}
