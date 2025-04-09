import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User
} from '@angular/fire/auth';
import { getDatabase, ref, get, child } from '@angular/fire/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Employee {
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

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loginForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  private readonly localKey = 'fbhgkjwruguegi';

  constructor(
    private auth: Auth,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // 🔁 Auto-login from localStorage
    const savedUser = localStorage.getItem(this.localKey);
    if (savedUser) {
      try {
        const employee: Employee = JSON.parse(savedUser);
        const dept = employee.department?.toUpperCase();

        if (dept === 'HR') {
          this.router.navigate(['/admin-dashboard']);
        } else if (dept === 'MANAGEMENT') {
          this.router.navigate(['/manager']);
        } else {
          this.router.navigate(['/employee-dashboard']);
        }
      } catch (e) {
        console.error('⚠️ Invalid local storage data:', e);
        localStorage.removeItem(this.localKey);
      }
    }
  }

  async signInWithGoogle(): Promise<void> {
    console.log('🔘 Google Sign-In clicked');
    this.loading = true;
    this.errorMessage = null;

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const user = userCredential.user;

      if (!user.email) {
        this.errorMessage = 'No email retrieved from Google account.';
        return;
      }

      const db = getDatabase();
      const dbRef = ref(db, 'employees');
      const snapshot = await get(child(dbRef, '/'));

      if (snapshot.exists()) {
        const employees = snapshot.val();
        const employeeList: Employee[] = Object.values(employees) as Employee[];
        const employee = employeeList.find(emp => emp.personal_mail === user.email);

        if (employee) {
          console.log('✅ Verified Employee via personal_mail:', employee);
          localStorage.setItem(this.localKey, JSON.stringify(employee));

          await this.delayedRedirect(employee);
        } else {
          console.log('❌ Unauthorized user, signing out...');
          this.errorMessage = 'Unauthorized user. Access denied.';
          await this.auth.signOut();

          try {
            await user.delete(); // Optional: clean up
          } catch (deleteError) {
            console.warn('⚠️ Could not auto-delete unauthorized account:', deleteError);
          }
        }
      } else {
        this.errorMessage = 'Employee database is empty.';
      }
    } catch (error: any) {
      console.error('❌ Google Login Error:', error);

      if (error.code === 'auth/popup-blocked') {
        this.errorMessage = 'Popup was blocked. Please allow popups in your browser.';
      } else {
        this.errorMessage = 'Google sign-in failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async login(): Promise<void> {
    console.log("🔘 Login button clicked!");
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      console.log('✅ Login Successful:', user);

      await this.checkUserRole(user);
    } catch (error: any) {
      console.error('❌ Login Error:', error);

      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'Employee does not exist.';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Wrong password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Invalid email format.';
      } else {
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    } finally {
      this.loading = false;
    }
  }

  async checkUserRole(user: User): Promise<void> {
    if (!user?.email) return;

    try {
      const db = getDatabase();
      const dbRef = ref(db, 'employees');
      const snapshot = await get(child(dbRef, '/'));

      if (snapshot.exists()) {
        const employees = snapshot.val();
        const employeeList: Employee[] = Object.values(employees) as Employee[];
        const employee = employeeList.find(emp => emp.email === user.email);

        if (employee && employee.department) {
          console.log('✅ Employee Found:', employee);
          localStorage.setItem(this.localKey, JSON.stringify(employee));

          await this.delayedRedirect(employee);
        } else {
          this.errorMessage = 'No associated employee record found.';
        }
      } else {
        this.errorMessage = 'Employee database is empty.';
      }
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      this.errorMessage = 'Error fetching user data. Please try again later.';
    }
  }

  // 🔁 Introduced delay to prevent guard issues
  private async delayedRedirect(employee: Employee): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 200ms delay

    const dept = employee.department?.toUpperCase();

    if (dept === 'HR') {
      this.router.navigate(['/admin-dashboard']);
    } else if (dept === 'MANAGEMENT') {
      this.router.navigate(['/manager']);
    } else {
      this.router.navigate(['/employee']);
    }
  }
}


// cachenull
// employeeData