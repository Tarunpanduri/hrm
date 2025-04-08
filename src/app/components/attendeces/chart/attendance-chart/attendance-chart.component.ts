import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { getDatabase, ref, get } from 'firebase/database';

@Component({
  selector: 'app-attendance-chart',
  standalone: false,
  templateUrl: './attendance-chart.component.html',
  styleUrls: ['./attendance-chart.component.css']
})
export class AttendanceChartComponent implements OnInit {
  pieChartOptions: any = null;
  barChartOptions: any = null;

  employees: any = {};
  attendance: any = {};
  attendanceByDepartment: { [key: string]: number } = {};
  workingHoursByDepartment: { [key: string]: number } = {};

  constructor(private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.fetchData();
    this.generateCharts();
    this.cdRef.detectChanges();
  }

  async fetchData() {
    const db = getDatabase();
    const today = this.getCurrentDate();

    const employeesRef = ref(db, 'employees');
    const employeesSnapshot = await get(employeesRef);
    if (employeesSnapshot.exists()) {
      this.employees = employeesSnapshot.val();
    }

    const attendanceRef = ref(db, `attendance/${today}`);
    const attendanceSnapshot = await get(attendanceRef);
    if (attendanceSnapshot.exists()) {
      this.attendance = attendanceSnapshot.val();
    }

    this.processData();
  }

  processData() {
    this.attendanceByDepartment = {};
    this.workingHoursByDepartment = {};

    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    for (const empId in this.attendance) {
      const emp = this.employees[empId];
      const attendance = this.attendance[empId];

      if (emp && attendance.status === "Present") {
        const department = emp.department;

        this.attendanceByDepartment[department] = (this.attendanceByDepartment[department] || 0) + 1;

        if (!attendance.checkin) continue;

        const checkinTime = this.convertTo24Hour(attendance.checkin);
        const checkoutTime = attendance.checkout ? this.convertTo24Hour(attendance.checkout) : this.convertTo24Hour(currentTime);

        const workingHours = checkoutTime - checkinTime;

        this.workingHoursByDepartment[department] = (this.workingHoursByDepartment[department] || 0) + workingHours;
      }
    }

    this.generateCharts();
  }

  generateCharts() {
    const departments = Object.keys(this.attendanceByDepartment);
    const attendanceValues = Object.values(this.attendanceByDepartment);
    const workingHourValues = Object.values(this.workingHoursByDepartment);

    const colors = ['#008080', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

    // === PIE CHART ===
    const pieChartData = departments.map((dept, index) => ({
      name: dept,
      value: this.attendanceByDepartment[dept],
      itemStyle: { color: colors[index % colors.length] }
    }));

    this.pieChartOptions = {
      title: {
        text: `Department-wise Attendance (${this.getCurrentDate()})`,
        left: 'center',
        bottom: 1,
        textStyle: { fontSize: 12 }
      },
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Present Employees',
          type: 'pie',
          radius: '50%',
          data: pieChartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    // === BAR CHART ===
    const barData = workingHourValues.map((value, index) => ({
      value: value,
      itemStyle: {
        color: colors[index % colors.length],
        borderRadius: [8, 8, 0, 0] // Rounded corners on top
      }
    }));

    this.barChartOptions = {
      title: {
        text: `Total Working Hours Per Department (${this.getCurrentDate()})`,
        left: 'center',
        bottom: 1,
        textStyle: { fontSize: 12 }
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: departments
      },
      yAxis: {
        type: 'value',
        name: 'Total Hours'
      },
      series: [
        {
          name: 'Hours Worked',
          type: 'bar',
          data: barData,
          barWidth: '50%'
        }
      ]
    };

    this.cdRef.detectChanges();
  }

  convertTo24Hour(time: string): number {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return hours + minutes / 60;
  }

  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
