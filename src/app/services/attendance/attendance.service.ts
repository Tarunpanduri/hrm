import { Injectable } from '@angular/core';
import { Database, ref, update, get } from '@angular/fire/database';
import { AuthService } from '../auth/auth.service';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private db: Database, private authService: AuthService) {}

  // ✅ Check-In Function
  markCheckIn(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user || !user.key) {
          console.error('No emp_id found!');
          return from([false]); 
        }

        const emp_Id = user.key;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const attendanceRef = ref(this.db, `attendance/${today}/${emp_Id}`);

        return from(get(attendanceRef)).pipe(
          switchMap(snapshot => {
            const attendanceData = snapshot.exists() ? snapshot.val() : {};
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (!attendanceData.checkin) {
              // First check-in of the day
              return from(update(attendanceRef, {
                checkin: currentTime,
                status: 'Present'
              })).pipe(map(() => true));
            } else {
              console.warn('Already checked in.');
              return from([false]);
            }
          })
        );
      })
    );
  }

  // ✅ Check-Out Function
  markCheckOut(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user || !user.key) {
          console.error('No emp_id found!');
          return from([false]); 
        }

        const emp_Id = user.key;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const attendanceRef = ref(this.db, `attendance/${today}/${emp_Id}`);

        return from(get(attendanceRef)).pipe(
          switchMap(snapshot => {
            const attendanceData = snapshot.exists() ? snapshot.val() : {};
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (attendanceData.checkin && !attendanceData.checkout) {
              // Checkout if checked in
              return from(update(attendanceRef, {
                checkout: currentTime
              })).pipe(map(() => true));
            } else {
              console.warn('Already checked out or not checked in yet.');
              return from([false]);
            }
          })
        );
      })
    );
  }
}
