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

  presentEmployees: any[] = [];

  constructor(private firebaseService: FirebaseDataService) {}

  ngOnInit(): void {
    this.firebaseService.getEmployeeAndAttendanceData().subscribe(({ employees, attendance }) => {
      const allEmployees = Object.values(employees || {});
      const presentEmpIds = Object.keys(attendance || {});
      this.presentEmployees = allEmployees.filter((emp: any) => presentEmpIds.includes(emp.emp_id));
    });
  }
}