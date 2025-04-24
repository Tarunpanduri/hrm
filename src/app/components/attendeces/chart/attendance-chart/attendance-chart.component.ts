import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.generateCharts(); // Regenerate charts with new font size
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

    for (const empId in this.attendance) {
      const emp = this.employees[empId];
      const attendance = this.attendance[empId];

      if (emp && attendance.status === 'Present') {
        const department = emp.department;
        this.attendanceByDepartment[department] = (this.attendanceByDepartment[department] || 0) + 1;

        if (!attendance.checkin) continue;

        const checkinDate = this.convertTimeToDate(attendance.checkin);
        const checkoutDate = attendance.checkout
          ? this.convertTimeToDate(attendance.checkout)
          : now;

        const workingMilliseconds = checkoutDate.getTime() - checkinDate.getTime();
        const workingHours = workingMilliseconds / (1000 * 60 * 60);

        if (workingHours > 0 && workingHours < 24) {
          this.workingHoursByDepartment[department] =
            (this.workingHoursByDepartment[department] || 0) + parseFloat(workingHours.toFixed(2));
        }
      }
    }
  }

  generateCharts() {
    const fontSize = this.getResponsiveFontSize();

    const departments = Object.keys(this.attendanceByDepartment);
    const pieChartData = departments.map((dept) => ({
      name: dept,
      value: this.attendanceByDepartment[dept]
    }));

    this.pieChartOptions = {
      title: {
        text: `Department-wise Attendance (${this.getCurrentDate()})`,
        left: 'center',
        bottom: 1,
        textStyle: { fontSize }
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

    const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];

    this.barChartOptions = {
      title: {
        text: `Total Working Hours Per Department (${this.getCurrentDate()})`,
        left: 'center',
        bottom: 1,
        textStyle: { fontSize }
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
          data: departments.map((dept, index) => ({
            value: this.workingHoursByDepartment[dept],
            itemStyle: { color: colors[index % colors.length] }
          })),
          barWidth: '50%'
        }
      ]
    };

    this.cdRef.detectChanges();
  }

  convertTimeToDate(timeStr: string): Date {
    const [timePart, modifier] = timeStr.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  }

  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ Responsive font size based on screen width
  getResponsiveFontSize(): number {
    const width = window.innerWidth;

    if (width <= 480) return 8;
    if (width <= 768) return 9;
    if (width <= 1280) return 10;
    return 14;
  }
}
