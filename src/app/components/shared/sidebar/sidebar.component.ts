import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {

  constructor(private router: Router) {}

  logout(): void {
    localStorage.removeItem('fbhgkjwruguegi'); 
    this.router.navigate(['']);
  }
  
}
