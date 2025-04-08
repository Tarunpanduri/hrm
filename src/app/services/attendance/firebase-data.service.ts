import { Injectable } from '@angular/core';
import { Database, getDatabase, ref, child, get, onValue } from '@angular/fire/database';
import { inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataService {
  private db: Database = inject(Database);

  getEmployees(): Observable<any> {
    return new Observable((observer) => {
      const employeesRef = ref(this.db, 'employees');
      onValue(employeesRef, (snapshot) => {
        observer.next(snapshot.val());
      });
    });
  }

  getTodayAttendance(): Observable<any> {
    const today = new Date().toISOString().slice(0, 10); // e.g., "2025-04-07"
    return new Observable((observer) => {
      const attendanceRef = ref(this.db, `attendance/${today}`);
      onValue(attendanceRef, (snapshot) => {
        observer.next(snapshot.val());
      });
    });
  }

  getEmployeeAndAttendanceData(): Observable<any> {
    return combineLatest([this.getEmployees(), this.getTodayAttendance()]).pipe(
      map(([employees, attendance]) => ({ employees, attendance }))
    );
  }
}
