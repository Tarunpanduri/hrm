import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

interface Employee {
  email: string;
  department: string;
  emp_id: string;
  location: string;
  name: string;
  profileImg: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentGuard implements CanActivate {

  private readonly localKey = 'fbhgkjwruguegi';

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const storedUser = localStorage.getItem(this.localKey);

    if (!storedUser) {
      console.warn('🚫 No user in localStorage. Redirecting...');
      return this.router.parseUrl('/');
    }

    try {
      const employee: Employee = JSON.parse(storedUser);
      const expectedDept = route.data['department']?.toUpperCase();
      const userDept = employee.department?.toUpperCase();

      if (expectedDept === 'ADMIN' && userDept === 'HR') return true;
      if (expectedDept === 'MANAGER' && userDept === 'MANAGEMENT') return true;
      if (expectedDept === 'EMPLOYEE' && userDept !== 'HR' && userDept !== 'MANAGEMENT') return true;

      console.warn(`⚠️ Department mismatch. Expected: ${expectedDept}, Found: ${userDept}`);
      return this.router.parseUrl('/');
    } catch (err) {
      console.error('❌ Failed to parse user from localStorage:', err);
      localStorage.removeItem(this.localKey);
      return this.router.parseUrl('/');
    }
  }
}
