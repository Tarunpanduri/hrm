import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-sidebar',
  standalone: false,
  templateUrl: './employee-sidebar.component.html',
  styleUrl: './employee-sidebar.component.css'
})
export class EmployeeSidebarComponent {


  
  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('fbhgkjwruguegi'); 
    this.router.navigate(['']);
  }
}
