import { Injectable } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { Database, ref, get, child } from '@angular/fire/database';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private db: Database) {}

  getCurrentUser(): Observable<any> {
    return user(this.auth).pipe(
      switchMap(async (authUser: User | null) => {
        if (!authUser) {
          console.error('User not authenticated!');
          return null;
        }

        // Reference to employees node
        const employeesRef = ref(this.db, 'employees');
        try {
          const snapshot = await get(employeesRef);
          if (snapshot.exists()) {
            console.log("user found")
            const employees = snapshot.val();

            // Find user by email
            const employeeKey = Object.keys(employees).find(
              key => employees[key].email === authUser.email
            );

            if (employeeKey) {
              return { ...employees[employeeKey], key: employeeKey };
            } else {
              console.error('User email not found in Realtime Database!');
              return null;
            }
          } else {
            console.error('No employees found in Realtime Database!');
            return null;
          }
        } catch (error) {
          console.error('Error fetching user from Realtime Database:', error);
          return null;
        }
      })
    );
  }
}
