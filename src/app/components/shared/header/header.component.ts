import { Component ,OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  employeeName: string = 'User';
  greeting: string = 'Good Morning'; 
  profileImg: string = 'profile.jpg';
  currentDateTime: string = '';


  ngOnInit(): void {
    this.getEmployeeName();
    this.setGreeting();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); 
  }

  getEmployeeName(): void {
    const storedData = localStorage.getItem('fbhgkjwruguegi');
    if (storedData) {
      const employee = JSON.parse(storedData);
      this.employeeName = employee.name || 'User';
      this.profileImg = employee.profileImg || 'profile.jpg';
    }
  }

  setGreeting(): void {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      this.greeting = 'Good Morning';
    } else if (currentHour < 16) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }



  updateDateTime(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    this.currentDateTime = now.toLocaleDateString('en-US', options);
  }
}
