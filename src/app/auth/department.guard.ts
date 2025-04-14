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
      const expectedDept = (route.data['department'] || '').toUpperCase();
      const userDept = (employee.department || '').toUpperCase();

      console.log('🔍 Checking Access...');
      console.log('Expected Department:', expectedDept);
      console.log('User Department:', userDept);

      switch (expectedDept) {
        case 'ADMIN':
          if (userDept === 'HR') return true;
          break;
        case 'MANAGER':
          if (userDept === 'MANAGEMENT') return true;
          break;
        case 'EMPLOYEE':
          if (userDept !== 'HR' && userDept !== 'MANAGEMENT') return true;
          break;
        default:
          console.warn('⚠️ Unknown department in route data');
          break;
      }

      console.warn(`🚫 Access denied. Expected: ${expectedDept}, Found: ${userDept}`);
      return this.router.parseUrl('/');
    } catch (err) {
      console.error('❌ Failed to parse user from localStorage:', err);
      localStorage.removeItem(this.localKey);
      return this.router.parseUrl('/');
    }
  }
}
