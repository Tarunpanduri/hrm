import { Component, OnInit, ElementRef, ViewChild,Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getDatabase, ref, get } from 'firebase/database';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-employee-report',
  standalone: false,
  templateUrl: './employee-report.component.html',
  styleUrls: ['./employee-report.component.css']
})
export class EmployeeReportComponent implements OnInit {
  @Input() cardwidth: string = 'auto';

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  private chartInstance: any;

  empId: string = '';
  employee: any;
  attendance: any[] = [];
  leaves: any[] = [];
  tasks: any[] = [];
  payroll: any = {};

  totalWorkingDays = 0;
  totalPresentDays = 0;
  avgWorkHours = 0;
  taskCompletionRate = 0;

  dataLoaded = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.empId = params['empId'];
      if (this.empId) {
        this.searchEmployee();
      }
    });
  }

  async searchEmployee(): Promise<void> {
    this.dataLoaded = false;
    const db = getDatabase();

    try {
      const empSnap = await get(ref(db, `/employees/${this.empId}`));
      if (empSnap.exists()) this.employee = empSnap.val();

      const attSnap = await get(ref(db, `/attendance`));
      if (attSnap.exists()) {
        const raw = attSnap.val();
        this.totalWorkingDays = Object.keys(raw).length;

        this.attendance = Object.entries(raw).map(([date, records]: [string, any]) => {
          const entry = records[this.empId];
          let hours = 0;

          if (entry?.checkin && entry?.checkout) {
            const inTime = this.parseTime(entry.checkin);
            const outTime = this.parseTime(entry.checkout);

            if (inTime && outTime && outTime > inTime) {
              hours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60);
            }
          }

          return {
            date,
            checkin: entry?.checkin ?? '-',
            checkout: entry?.checkout ?? '-',
            hours: parseFloat(hours.toFixed(1)) || 0
          };
        });

        const validDays = this.attendance.filter(a => a.hours > 0);
        this.totalPresentDays = validDays.length;
        const totalHours = validDays.reduce((sum, a) => sum + a.hours, 0);
        this.avgWorkHours = +(totalHours / (validDays.length || 1)).toFixed(1);

        this.buildAttendanceChart();
      }

      const leaveSnap = await get(ref(db, `/leaveRequests/${this.empId}`));
      if (leaveSnap.exists()) this.leaves = Object.values(leaveSnap.val());

      const taskSnap = await get(ref(db, `/tasks`));
      if (taskSnap.exists()) {
        this.tasks = Object.values(taskSnap.val()).filter(
          (t: any) => t.assignedTo?.includes(this.empId)
        );
        const completed = this.tasks.filter(t => t.completed).length;
        this.taskCompletionRate = this.tasks.length ? Math.round((completed / this.tasks.length) * 100) : 0;
      }

      const payrollSnap = await get(ref(db, `/payroll/${this.empId}`));
      if (payrollSnap.exists()) this.payroll = payrollSnap.val();

      this.dataLoaded = true;
    } catch (error) {
      console.error("Error fetching employee report data:", error);
    }
  }

  parseTime(timeStr: string): Date | null {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!match) return null;

    let [_, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (period.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  buildAttendanceChart(): void {
    if (!this.chartContainer) return;

    const chartDom = this.chartContainer.nativeElement;
    this.chartInstance = echarts.init(chartDom);

    const dates = this.attendance.map(a => a.date);
    const hours = this.attendance.map(a => a.hours);

    const option: EChartsOption = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: 'Hours Worked'
      },
      series: [
        {
          data: hours,
          type: 'bar',
          itemStyle: {
            color: '#00a49d'
          }
        }
      ]
    };

    this.chartInstance.setOption(option);
  }

  generatePDF(): void {
    if (!this.dataLoaded) {
      alert("Please search and load employee data first.");
      return;
    }
  
    const doc = new jsPDF();
    const logoUrl = 'https://i.ibb.co/Z1YVmTKh/CLIM-IT-SOLUTIONS-final.jpg';
    const img = new Image();
  
    img.onload = () => {
      doc.addImage(img, 'PNG', 13, 5, 40, 35);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'normal');
  
      const empId = this.employee?.emp_id ?? 'Unknown ID';
      const empName = this.employee?.name ?? 'Unknown Name';
  
      doc.setFont('bold');
      doc.setFontSize(12);
      doc.text(`Employee Report - ${empId}`, 60, 22);
      doc.setFont('bold');
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 60, 27);

  
      // Basic Info data
      const basicInfo = [
        ['Name', empName],
        ['Role', this.employee?.role ?? '-'],
        ['Dept', this.employee?.department ?? '-'],
        ['Location', this.employee?.location ?? '-'],
        ['Joining Date', this.employee?.joiningDate ?? '-']
      ];
  
      // Performance data
      const performance = [
        ['Attendance', `${(this.totalPresentDays / this.totalWorkingDays * 100).toFixed(1)}%`],
        ['Avg Hours', `${this.avgWorkHours} hrs/day`],
        ['Task Completion', `${this.taskCompletionRate}%`]
      ];
  
      // Merge rows into one table with 4 columns (2 sections)
      const maxRows = Math.max(basicInfo.length, performance.length);
      const combinedBody = [];
  
      for (let i = 0; i < maxRows; i++) {
        const basicRow = basicInfo[i] ?? ['', ''];
        const perfRow = performance[i] ?? ['', ''];
        combinedBody.push([basicRow[0], basicRow[1], perfRow[0], perfRow[1]]);
      }
  
      autoTable(doc, {
        startY: 40,
        head: [['Basic Info', '', 'Performance Summary', '']],
        body: combinedBody,
        styles: { halign: 'left', font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { fontStyle: 'bold' },
          2: { fontStyle: 'bold' }
        }
      });
  
      let nextY = doc.lastAutoTable.finalY + 10;
  
      if (this.chartInstance) {
        const chartImage = this.chartInstance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        doc.addImage(chartImage, 'PNG', 15, nextY, 180, 80);
        nextY += 90;
      }
  
      // Tasks
      doc.setFontSize(13);
      doc.text('Tasks Log', 14, nextY + 10);
      autoTable(doc, {
        startY: nextY + 15,
        head: [['Task', 'Due Date', 'Status']],
        body: this.tasks.map(t => [t.title ?? '-', t.dueDate ?? '-', t.completed ? 'Completed' : 'Pending'])
      });
  
      nextY = doc.lastAutoTable.finalY + 10;
  
      // Leaves
      doc.text('Leaves Log', 14, nextY + 10);
      autoTable(doc, {
        startY: nextY + 15,
        head: [['From', 'To', 'Type', 'Status', 'Reason']],
        body: this.leaves.map(l => [
          l.startDate ?? '-', l.endDate ?? '-', l.type ?? '-', l.status ?? '-', l.reason ?? '-'
        ])
      });
  
      nextY = doc.lastAutoTable.finalY + 10;
  
      // Payroll
      doc.text('Payroll Log', 14, nextY + 10);
      autoTable(doc, {
        startY: nextY + 15,
        head: [['Month', 'Basic Salary', 'Bonus', 'Net Pay', 'Paid On']],
        body: Object.entries(this.payroll).map(([month, pay]: any) => [
          month,
          `₹${pay.basicSalary ?? 0}`,
          `₹${pay.bonus ?? 0}`,
          `₹${pay.netPay ?? 0}`,
          pay.paymentDate ?? '-'
        ])
      });
  
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Attendance Log', 14, 15);
  
      autoTable(doc, {
        startY: 20,
        head: [['Date', 'Check-in', 'Check-out', 'Hours']],
        body: this.attendance.map(a => [
          a.date ?? '-', a.checkin ?? '-', a.checkout ?? '-', a.hours?.toFixed(1) ?? '-'
        ])
      });
  
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    };
  
    img.src = logoUrl;
  }
  
  
}  