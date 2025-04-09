import { Injectable } from '@angular/core';

export interface Employee {
  email: string;
  personal_mail?: string;
  department: string;
  emp_id: string;
  location: string;
  name: string;
  profileImg: string;
  role: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly LOCAL_KEY = 'fbhgkjwruguegi';
  private employee: Employee | null = null;

  setEmployee(emp: Employee): void {
    this.employee = emp;
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(emp));
  }

  getEmployee(): Employee | null {
    if (this.employee) return this.employee;
    const stored = localStorage.getItem(this.LOCAL_KEY);
    if (stored) {
      try {
        this.employee = JSON.parse(stored);
        return this.employee;
      } catch (e) {
        localStorage.removeItem(this.LOCAL_KEY);
        return null;
      }
    }
    return null;
  }

  clear(): void {
    this.employee = null;
    localStorage.removeItem(this.LOCAL_KEY);
  }
}
