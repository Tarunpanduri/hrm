import { Component , OnInit,Input } from '@angular/core';
import { FirebaseDataService } from '../../../services/attendance/firebase-data.service';

@Component({
  selector: 'app-absent-employees',
  standalone: false,
  templateUrl: './absent-employees.component.html',
  styleUrl: './absent-employees.component.css'
})
export class AbsentEmployeesComponent implements OnInit {
  @Input() cardwidth: string = 'auto';
  isLoading: boolean = true; 
  absentEmployees: any[] = [];


  constructor(private firebaseService: FirebaseDataService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false; // Simulate data loading
    }, 2000);
    this.firebaseService.getEmployeeAndAttendanceData().subscribe(({ employees, attendance }) => {
      const employeeList = Object.values(employees || {}) as any[];
      const presentIds = attendance ? Object.keys(attendance) : [];

      this.absentEmployees = employeeList.filter(emp => 
        !presentIds.includes(emp.emp_id) && emp.department?.toLowerCase() !== 'management'
      );
    });
  }
}