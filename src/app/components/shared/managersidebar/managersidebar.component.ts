import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-managersidebar',
  standalone: false,
  templateUrl: './managersidebar.component.html',
  styleUrl: './managersidebar.component.css'
})
export class ManagersidebarComponent {
  
  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('fbhgkjwruguegi'); 
    this.router.navigate(['']);
  }
  
}
