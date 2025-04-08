// Updated TypeScript
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Database, ref, onValue, off } from '@angular/fire/database';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-people',
  standalone: false,
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit, OnDestroy {
  @ViewChild('departmentsWrapper', { static: false }) departmentsWrapper!: ElementRef;

  employees: any[] = [];
  filteredEmployees: any[] = [];
  departments: { name: string, img: string }[] = [];
  chartOptions: EChartsOption | null = null;
  selectedDepartment: string | null = null;
  private employeeRef: any;

  constructor(private database: Database, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.employeeRef = ref(this.database, 'employees'); 
    this.fetchDepartments();
    this.fetchEmployees();
  }

  ngOnDestroy(): void {
    off(this.employeeRef);
  }

  fetchDepartments(): void {
    const departmentsRef = ref(this.database, 'climit/departments');
  
    onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object to array of { name, img }
        this.departments = Object.values(data).map((dept: any) => ({
          name: dept.name,
          img: dept.img
        }));
        setTimeout(() => this.updateChart(), 100); // Update chart after setting departments
        this.cdr.detectChanges();
      }
    });
  }
  

  fetchEmployees(): void {
    onValue(this.employeeRef, (snapshot) => {
      const data = snapshot.val();
      this.employees = data ? Object.values(data) : [];
      this.filteredEmployees = [...this.employees];
      setTimeout(() => this.updateChart(), 100);
    });
  }

  updateChart(): void {
    const departmentCounts = this.getDepartmentCounts();
  
    this.chartOptions = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        type: 'scroll',               
        orient: 'horizontal',         
        bottom: 'bottom',
        itemGap: 10,
        textStyle: {
          overflow: 'truncate',       
          width: 70                   
        },
        pageButtonItemGap: 0,
        pageIconSize: 10,
        pageButtonGap: 5,
        pageTextStyle: {
          color: '#999'
        }
      },
      series: [
        {
          name: 'Employees',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: departmentCounts
        }
      ]
    };
  
    this.cdr.detectChanges();
  }
  

  getDepartmentCounts() {
    const counts: { [key: string]: number } = {};
    this.employees.forEach(emp => {
      const department = emp.department || 'Unknown';
      counts[department] = (counts[department] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }

  getDepartmentClass(department: string): string {
    if (!department || typeof department !== 'string') return 'default-class';
    return department.replace(/ & /g, '-').replace(/\s+/g, '-').toLowerCase();
  }

  selectDepartment(departmentName: string): void {
    if (this.selectedDepartment === departmentName) {
      this.selectedDepartment = null;
      this.filteredEmployees = [...this.employees];
    } else {
      this.selectedDepartment = departmentName;
      this.filteredEmployees = this.employees.filter(emp => emp.department === departmentName);
    }
  }
}
