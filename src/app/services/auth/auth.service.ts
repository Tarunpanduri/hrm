import { Injectable } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { Database, ref, get } from '@angular/fire/database';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth, private db: Database) {}

  getCurrentUser(): Observable<any> {
    return user(this.auth).pipe(
      switchMap((authUser: User | null) => {
        if (!authUser) {
          console.error('User not authenticated!');
          return of(null);
        }

        const employeesRef = ref(this.db, 'employees');

        // Convert the async Firebase call into an Observable
        return from(
          get(employeesRef).then(snapshot => {
            if (snapshot.exists()) {
              const employees = snapshot.val();
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
          }).catch(error => {
            console.error('Error fetching user from Realtime Database:', error);
            return null;
          })
        );
      })
    );
  }
}
