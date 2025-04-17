import { Component, OnInit,Input } from '@angular/core';
import { FirebaseDataService } from '../../..//services/attendance/firebase-data.service';

@Component({
  selector: 'app-present-employees',
  standalone:false,
  templateUrl: './present-employees.component.html',
  styleUrls: ['./present-employees.component.css']
})
export class PresentEmployeesComponent implements OnInit {
  @Input() cardwidth: string = 'auto'; 
  isLoading: boolean = true;

  presentEmployees: any[] = [];

  constructor(private firebaseService: FirebaseDataService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false; // Simulate data loading
    }, 2000);
    this.firebaseService.getEmployeeAndAttendanceData().subscribe(({ employees, attendance }) => {
      const allEmployees = Object.values(employees || {});
      const presentEmpIds = Object.keys(attendance || {});
      this.presentEmployees = allEmployees.filter((emp: any) => presentEmpIds.includes(emp.emp_id));
    });
  }
}