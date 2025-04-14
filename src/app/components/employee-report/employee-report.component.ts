import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getDatabase, ref, get } from 'firebase/database';  // Firebase modular imports
import { getAuth } from 'firebase/auth';  // Add Firebase Auth if needed
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AttendanceEntry {
  date: string;
  checkin?: string;
  checkout?: string;
  status?: string;
}

interface LeaveEntry {
  type: string;
  reason: string;
  status: string;
  startDate: string;
  endDate: string;
  days: number;
}

interface TaskEntry {
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

interface PayrollEntry {
  basicSalary: number;
  bonus: number;
  netPay: number;
  paymentDate: string;
  [key: string]: any;
}

@Component({
  selector: 'app-employee-report',
  standalone: false,
  templateUrl: './employee-report.component.html',
  styleUrls: ['./employee-report.component.css']
})
export class EmployeeReportComponent implements OnInit {
  empId: string = '';
  employee: any;
  attendance: AttendanceEntry[] = [];
  leaves: LeaveEntry[] = [];
  tasks: TaskEntry[] = [];
  payroll: { [month: string]: PayrollEntry } = {};
  attendanceChartOptions: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the empId from the route if it's passed as a route parameter
    this.route.params.subscribe(params => {
      this.empId = params['empId'];  // Assuming 'empId' is passed in the route
      if (this.empId) {
        this.searchEmployee();  // Fetch data for the employee with the given empId
      }
    });
  }

  async searchEmployee(): Promise<void> {
    if (!this.empId) return;

    const db = getDatabase();  // Get the Firebase Realtime Database instance

    // Fetch employee profile
    const empRef = ref(db, `/employees/${this.empId}`);
    const empSnapshot = await get(empRef);
    if (empSnapshot.exists()) {
      this.employee = empSnapshot.val();
    }

    // Fetch attendance records for the employee
    const attendanceRef = ref(db, '/attendance');
    const attendanceSnapshot = await get(attendanceRef);
    if (attendanceSnapshot.exists()) {
      const data = attendanceSnapshot.val();
      this.attendance = Object.entries(data || {}).flatMap(([date, records]: any) => {
        if (records[this.empId]) {
          return [{ date, ...records[this.empId] }];
        }
        return [];
      });
      this.prepareAttendanceChart();
    }

    // Fetch leave history
    const leaveRef = ref(db, `/leaveRequests/${this.empId}`);
    const leaveSnapshot = await get(leaveRef);
    if (leaveSnapshot.exists()) {
      this.leaves = Object.values(leaveSnapshot.val() || {});
    }

    // Fetch assigned tasks for the employee
    const tasksRef = ref(db, '/tasks');
    const tasksSnapshot = await get(tasksRef);
    if (tasksSnapshot.exists()) {
      this.tasks = Object.values(tasksSnapshot.val() || {}).filter((task: any) => task.assignedTo?.includes(this.empId)) as TaskEntry[];
    }

    // Fetch payroll data for the employee
    const payrollRef = ref(db, `/payroll/${this.empId}`);
    const payrollSnapshot = await get(payrollRef);
    if (payrollSnapshot.exists()) {
      this.payroll = payrollSnapshot.val() as { [month: string]: PayrollEntry };
    }
  }

  prepareAttendanceChart(): void {
    const labels = this.attendance.map(a => a.date);
    const hours = this.attendance.map(a => this.calculateHours(a.checkin, a.checkout));

    this.attendanceChartOptions = {
      tooltip: {},
      xAxis: { data: labels },
      yAxis: {},
      series: [{
        name: 'Work Hours',
        type: 'bar',
        data: hours
      }]
    };
  }

  calculateHours(checkin?: string, checkout?: string): number {
    if (!checkin || !checkout) return 0;
    const inDate = new Date(`1970-01-01T${this.to24Hrs(checkin)}`);
    const outDate = new Date(`1970-01-01T${this.to24Hrs(checkout)}`);
    return Math.abs((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60));
  }

  to24Hrs(time: string): string {
    const [t, modifier] = time.split(' ');
    let [hours, minutes] = t.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  exportPDF(): void {
    const data: any = document.getElementById('report');
    if (data) {
      html2canvas(data).then(canvas => {
        const img = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = (pdf as any).getImageProperties(img);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${this.empId}_employee_report.pdf`);
      });
    }
  }
}
