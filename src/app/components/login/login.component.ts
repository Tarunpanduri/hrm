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
  showPassword: boolean = false;


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
      const snapshot = await get(child(ref(db), 'employees'));

      if (snapshot.exists()) {
        const employees = snapshot.val();
        const userEmail = user.email.toLowerCase();

        let matchedEmployee: Employee | null = null;
        Object.keys(employees).forEach((key) => {
          const emp = employees[key];
          if (emp.personal_mail?.toLowerCase() === userEmail) {
            matchedEmployee = emp;
          }
        });

        if (matchedEmployee) {
          console.log('✅ Verified Employee via personal_mail:', matchedEmployee);
          localStorage.setItem(this.localKey, JSON.stringify(matchedEmployee));
          await this.delayedRedirect(matchedEmployee);
        } else {
          console.log('❌ Unauthorized user, signing out...');
          this.errorMessage = 'Unauthorized user. Access denied.';
          await this.auth.signOut();
          try {
            await user.delete(); // optional cleanup
          } catch (err) {
            console.warn('⚠️ Could not auto-delete unauthorized account:', err);
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


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
      const snapshot = await get(child(ref(db), 'employees'));

      if (snapshot.exists()) {
        const employees = snapshot.val();
        const userEmail = user.email.toLowerCase();

        let matchedEmployee: Employee | null = null;
        Object.keys(employees).forEach((key) => {
          const emp = employees[key];
          if (emp.email?.toLowerCase() === userEmail) {
            matchedEmployee = emp;
          }
        });

        if (matchedEmployee) {
          console.log('✅ Employee Found:', matchedEmployee);
          localStorage.setItem(this.localKey, JSON.stringify(matchedEmployee));
          await this.delayedRedirect(matchedEmployee);
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

  private async delayedRedirect(employee: Employee): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

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