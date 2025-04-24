import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admindashboard',
  standalone: false,
  templateUrl: './admindashboard.component.html',
  styleUrl: './admindashboard.component.css'
})
export class AdmindashboardComponent implements OnInit {

  employeeName: string = 'User'; // Default Name
  greeting: string = 'Good Morning'; // Default Greeting

  tasks = [
    { title: 'Project Deadline @ 4/05/25', assignedTo: '@SESHA', time: '01/04/25 3:35PM' },
    { title: 'Client Meet on 10/04/25 on Monday afternoon with Rajesh B', assignedTo: '@suneel', time: '01/04/25 3:33PM' }
  ];

  leaveRequests = [
    { type: 'Casual Leave', startDate: 'Aug 2, 2024', endDate: 'Aug 2, 2024', days: 0.5, status: 'Approved' },
    { type: 'Sick Leave', startDate: 'Aug 2, 2024', endDate: 'Aug 2, 2024', days: 1.0, status: 'Cancelled' },
    { type: 'Casual Leave', startDate: 'May 29, 2024', endDate: 'May 29, 2024', days: 0.0, status: 'Requested' }
  ];

  attendees = [
    { name: 'Sasi Kiran', img: 'user1.jpg' },
    { name: 'Seshu', img: 'user2.jpg' },
    { name: 'Tarun', img: 'user3.jpg' },
    { name: 'Hyundai', img: 'user4.jpg' }
  ];

  chartOptions = {
    chart: { type: 'column' },
    title: { text: 'Departments' },
    xAxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'] },
    yAxis: { title: { text: 'Employees' } },
    series: [
      { name: 'Developer', data: [20, 80, 150, 70, 50, 60] },
      { name: 'Marketing', data: [10, 60, 40, 50, 30, 40] },
      { name: 'Sales', data: [5, 30, 10, 30, 20, 30] }
    ]
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getEmployeeName();
    this.setGreeting();
  }

  getEmployeeName(): void {
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      const employee = JSON.parse(storedData);
      this.employeeName = employee.name || 'User';
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

  logout(): void {
    localStorage.removeItem('cachenull'); 
    this.router.navigate(['']);
  }
}
