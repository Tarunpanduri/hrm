import { Component, OnInit } from '@angular/core';
import { getDatabase, ref, onValue, get, Database, set } from 'firebase/database';
import { EChartsOption } from 'echarts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

@Component({
  selector: 'app-chart-group-two',
  standalone:false,
  templateUrl: './chart-group-two.component.html',
  styleUrls: ['./chart-group-two.component.css']
})
export class ChartGroupTwoComponent implements OnInit {
  pieChartOptions: EChartsOption | null = null;
  chartOptions: EChartsOption | null = null;
  
  payrollData: any = {};
  totalExpensesPerMonth: { [key: string]: number } = {};
  attendanceByDepartment: { [key: string]: number } = {};
  
  // Add these properties
  selectedMonthForView: string = '';
  previewPdfUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    await this.fetchPayrollData();
    this.calculateTotalExpenses();
    await this.fetchAttendanceByDepartment();
    this.generateCharts();
  }

  // For download
  async downloadPayslip(month: string) {
    const doc = await this.generatePayslipPdf(month);
    doc.save(`Payslip_${month}.pdf`);
  }

  // For preview
  async viewPayslip(month: string) {
    this.selectedMonthForView = month;
    const doc = await this.generatePayslipPdf(month);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
  }

  async fetchPayrollData() {
    const db = getDatabase();
    const payrollRef = ref(db, 'payroll');
    const snapshot = await get(payrollRef);
    if (snapshot.exists()) {
      this.payrollData = snapshot.val();
    }
  }

  calculateTotalExpenses() {
    for (const empId in this.payrollData) {
      const employeePayroll = this.payrollData[empId];

      for (const monthYear in employeePayroll) {
        const payroll = employeePayroll[monthYear];

        const total = (payroll.basicSalary || 0) +
                      (payroll.bonus || 0) +
                      (payroll.hra || 0) +
                      (payroll.pfDeduction || 0) +
                      (payroll.communicationAllowance || 0) +
                      (payroll.conveyanceAllowance || 0) +
                      (payroll.foodCoupons || 0) +
                      (payroll.travelReimbursement || 0) +
                      (payroll.specialAllowance || 0) +
                      (payroll.professionalTax || 0);

        this.totalExpensesPerMonth[monthYear] = (this.totalExpensesPerMonth[monthYear] || 0) + total;
      }
    }
  }

  async fetchAttendanceByDepartment() {
    const db = getDatabase();
    const today = this.getFormattedDate();

    const attendanceRef = ref(db, `attendance/${today}`);
    const attendanceSnap = await get(attendanceRef);

    const employeeRef = ref(db, 'employees');
    const employeeSnap = await get(employeeRef);

    const tempDeptCount: { [key: string]: number } = {};

    if (attendanceSnap.exists() && employeeSnap.exists()) {
      const attendanceData = attendanceSnap.val();
      const employeeData = employeeSnap.val();

      for (const empId in attendanceData) {
        const attendanceInfo = attendanceData[empId];
        if (attendanceInfo.status === 'Present') {
          const empDetails = employeeData[empId];
          if (empDetails && empDetails.department) {
            const dept = empDetails.department;
            tempDeptCount[dept] = (tempDeptCount[dept] || 0) + 1;
          }
        }
      }
    }

    this.attendanceByDepartment = tempDeptCount;
  }

  

  generateCharts() {
    const months = Object.keys(this.totalExpensesPerMonth);
    const expenses = months.map(month => this.totalExpensesPerMonth[month]);

    this.chartOptions = {
      title: {
        text: 'Company Payroll Expenses Per Month',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Expenses (INR)',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: 'Total Expenses',
          type: 'bar',
          data: expenses,
          itemStyle: {
            color: '#5470C6'
          },
          barWidth: '50%'
        }
      ]
    };

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
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item'
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
  }

  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-GB');
  }

  getFormattedDate(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async generatePayslipPdf(month: string): Promise<jsPDF> {
    const employee = JSON.parse(localStorage.getItem('fbhgkjwruguegi') || '{}');
    console.log('PayslipTS : ', employee);
    const payroll = this.payrollData[month];
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({ title: `Payslip ${month} - ${employee.name}` });

    // Load and add logo first
    const logoUrl = 'https://i.ibb.co/Z1YVmTKh/CLIM-IT-SOLUTIONS-final.jpg';
    await this.addImageToPdf(doc, logoUrl, 13, 10, 45, 35);

    // Rest of the PDF content...
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`PAYSLIP ${month.toUpperCase()}`, 65, 15);

    // COMPANY INFO (Left aligned) 
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('CLIM IT SOLUTION', 15, 40);
    doc.text('FLAT NO 101/A, VV VINTAGE BOULEYARD', 15, 45);
    doc.text('RAJBHAVAN ROAD, SOMAJIGUDA', 15, 50);
    doc.text('HYDERABAD TELANGANA 500082', 15, 55);

    // EMPLOYEE NAME (Left aligned with horizontal line below)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(employee.name.toUpperCase(), 15, 70);
    
    // Horizontal line below name
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(15, 74, 195, 74);

    // EMPLOYEE DETAILS TABLES (aligned left)
    autoTable(doc, {
      startY: 80,
      head: [['Employee Number', 'Date Joined', 'Department', 'Sub Department']],
      body: [[employee.emp_id, employee.joiningDate || '17 Oct 2024', employee.department, 'N/A']],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { halign: 'left' },
      margin: { left: 15 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [['Designation', 'Payment Mode', 'Bank', 'Bank IFSC']],
      body: [[
        employee.role || 'Employee', 
        payroll.paymentMode || 'Bank Transfer', 
        payroll.bankName, 
        payroll.bankIfsc
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { halign: 'left' },
      margin: { left: 15 }
    });

    // PAN NUMBER SECTION
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [['Bank Account', 'PAN', 'UAN', 'PF Number']],
      body: [[
        payroll.bankAccount,
        employee.panNumber,
        employee.uan,
        employee.pfNumber || 'APHYD34317070011111'
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { halign: 'left' },
      margin: { left: 15 }
    });

    // SALARY DETAILS HEADER
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY DETAILS', 15, doc.lastAutoTable.finalY + 13);
    
    // Horizontal line below salary details
    doc.line(15, doc.lastAutoTable.finalY + 17, 195, doc.lastAutoTable.finalY + 17);

    // DAYS TABLE
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 23,
      head: [['Actual Payable Days', 'Total Working Days', 'Loss Of Pay Days', 'Days Payable']],
      body: [[
        payroll.actualPayableDays?.toFixed(1) || '0.0',
        payroll.totalWorkingDays?.toFixed(1) || '0.0',
        payroll.lossOfPayDays?.toFixed(1) || '0.0',
        payroll.daysPayable || '0'
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { halign: 'left' },
      margin: { left: 15 }
    });

    // EARNINGS AND DEDUCTIONS
    const totalEarnings = this.sum([
      payroll.basicSalary,
      payroll.hra,
      payroll.conveyanceAllowance,
      payroll.travelReimbursement,
      payroll.foodCoupons,
      payroll.communicationAllowance
    ]);

    const totalDeductions = this.sum([
      payroll.professionalTax,
      payroll.incomeTax,
      payroll.pfDeduction
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['EARNINGS', 'AMOUNT', 'CONTRIBUTIONS / DEDUCTIONS', 'AMOUNT']],
      body: [
        ['Basic', this.formatCurrency(payroll.basicSalary), 'PF Employee', this.formatCurrency(payroll.pfDeduction)],
        ['HRA', this.formatCurrency(payroll.hra), 'Professional Tax', this.formatCurrency(payroll.professionalTax)],
        ['Conveyance Allowance', this.formatCurrency(payroll.conveyanceAllowance), 'Total Income Tax', this.formatCurrency(payroll.incomeTax)],
        ['Travel Reimbursement (LTA)', this.formatCurrency(payroll.travelReimbursement), '', ''],
        ['Food Coupons', this.formatCurrency(payroll.foodCoupons), '', ''],
        ['COMMUNICATION ALLOWANCE', this.formatCurrency(payroll.communicationAllowance), '', ''],
        [
          { content: 'Total Earnings (A)', styles: { fontStyle: 'bold', halign: 'left' } }, 
          { content: this.formatCurrency(totalEarnings), styles: { fontStyle: 'bold', halign: 'right' } },
          { content: 'Total Deductions (B)', styles: { fontStyle: 'bold', halign: 'left' } },
          { content: this.formatCurrency(totalDeductions), styles: { fontStyle: 'bold', halign: 'right' } }
        ]
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: { halign: 'left' },
      columnStyles: {
        0: { cellWidth: 60, halign: 'left' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 60, halign: 'left' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 15 }
    });

    const netPay = totalEarnings - totalDeductions;

    // NET PAY SECTION
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      body: [
        [
          { 
            content: 'Net Salary Payable ( A - B )', 
            styles: { fontStyle: 'bold', halign: 'left' } 
          },
          { 
            content: this.formatCurrency(netPay), 
            styles: { fontStyle: 'bold', halign: 'left' } 
          }
        ],
        [
          { 
            content: 'Net Salary in words', 
            styles: { fontStyle: 'bold', halign: 'left' } 
          },
          { 
            content: this.numberToWords(netPay) + ' Rupees only', 
            styles: { fontStyle: 'normal', halign: 'left' } 
          }
        ]
      ],
      theme: 'plain',
      margin: { left: 15, right: 15 },
      styles: { cellPadding: 2 }
    });

    // FOOTER NOTES
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Note : All amounts displayed in this payslip are in INR', 15, doc.lastAutoTable.finalY + 10);
    doc.text('*This is a system generated salary slip and does not require signature.', 15, doc.lastAutoTable.finalY + 15);

    return doc;
  }

  private async addImageToPdf(doc: jsPDF, url: string, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        doc.addImage(img, 'JPEG', x, y, width, height);
        resolve();
      };
      img.onerror = () => {
        console.error('Failed to load image:', url);
        resolve();
      };
    });
  }

  private formatCurrency(amount: number): string {
    return amount?.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) || '0.00';
  }

  sum(values: number[]): number {
    return values.reduce((acc, val) => acc + (val || 0), 0);
  }

  numberToWords(num: number): string {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
    if (num === 0) return 'Zero';
  
    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    };
  
    return inWords(Math.floor(num));
  }
}