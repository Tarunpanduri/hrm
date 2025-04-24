import { Component, OnInit } from '@angular/core';
import { getDatabase, ref, get } from 'firebase/database';
import { EChartsOption } from 'echarts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { KeyValue } from '@angular/common';

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
  
  payrollData: { [key: string]: any } = {};
  totalExpensesPerMonth: { [key: string]: number } = {};
  attendanceByDepartment: { [key: string]: number } = {};
  
  selectedMonthForView: string = '';
  previewPdfUrl: SafeResourceUrl | null = null;
  currentYear: string = new Date().getFullYear().toString();
  showPdfViewer: boolean = false;
  pdfBlobUrl: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    await this.fetchPayrollData();
    this.calculateTotalExpenses();
    await this.fetchAttendanceByDepartment();
    this.generateCharts();
  }

  getObjectKeysLength(obj: any): number {
    return obj ? Object.keys(obj).length : 0;
  }

  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  }

  async fetchPayrollData() {
    try {
      const db = getDatabase();
      const payrollRef = ref(db, 'payroll');
      const snapshot = await get(payrollRef);
      
      if (snapshot.exists()) {
        const allPayrollData = snapshot.val();
        const employeeData = localStorage.getItem('fbhgkjwruguegi');
        const employee = employeeData ? JSON.parse(employeeData) : {};
        
        if (!employee?.emp_id) {
          console.error('Employee data not found in localStorage');
          this.payrollData = {};
          return;
        }
        
        this.payrollData = allPayrollData[employee.emp_id] || {};
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      this.payrollData = {};
    }
  }

  calculateTotalExpenses() {
    this.totalExpensesPerMonth = {};
    
    if (!this.payrollData || Object.keys(this.payrollData).length === 0) {
      console.warn('No payroll data available');
      return;
    }
  
    // Iterate through each month's payroll data
    for (const monthYear in this.payrollData) {
      // Extract month and year from keys like "April_2025" or "May 2025"
      const [monthName, year] = monthYear.split(/_|\s/); // Split by underscore or space
      
      // Check if the record belongs to current year
      if (year === this.currentYear) {
        const payroll = this.payrollData[monthYear];
        
        // Convert month name to number (1-12)
        const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
        const monthKey = monthNumber.toString().padStart(2, '0'); // "04" for April
        
        // Calculate total for this month
        this.totalExpensesPerMonth[monthKey] = 
          (payroll.basicSalary || 0) +
          (payroll.hra || 0) +
          (payroll.conveyanceAllowance || 0) +
          (payroll.communicationAllowance || 0) +
          (payroll.foodCoupons || 0) +
          (payroll.travelReimbursement || 0) +
          (payroll.specialAllowance || 0) +
          (payroll.bonus || 0);
          
        console.log(`Month ${monthKey} (${monthName}): ${this.totalExpensesPerMonth[monthKey]}`);
      }
    }
  
    console.log('Total expenses per month:', this.totalExpensesPerMonth);
  }

  async fetchAttendanceByDepartment() {
    const db = getDatabase();
    const today = this.getFormattedDate();

    const [attendanceSnap, employeeSnap] = await Promise.all([
      get(ref(db, `attendance/${today}`)),
      get(ref(db, 'employees'))
    ]);

    const tempDeptCount: { [key: string]: number } = {};

    if (attendanceSnap.exists() && employeeSnap.exists()) {
      const attendanceData = attendanceSnap.val();
      const employeeData = employeeSnap.val();

      for (const empId in attendanceData) {
        if (attendanceData[empId].status === 'Present') {
          const empDetails = employeeData[empId];
          if (empDetails?.department) {
            const dept = empDetails.department;
            tempDeptCount[dept] = (tempDeptCount[dept] || 0) + 1;
          }
        }
      }
    }

    this.attendanceByDepartment = tempDeptCount;
  }

  generateCharts() {
    // 1. Monthly Expenses Chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const expensesData = Array(12).fill(0);
    
    // Fill the expenses data array with actual values
    Object.entries(this.totalExpensesPerMonth).forEach(([monthNum, amount]) => {
      const monthIndex = parseInt(monthNum) - 1; // Convert month number (1-12) to array index (0-11)
      if (monthIndex >= 0 && monthIndex < 12) {
        expensesData[monthIndex] = amount;
      }
    });

    this.chartOptions = {
      title: { 
        text: `Monthly Payroll Expenses (${this.currentYear})`, 
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: { 
        trigger: 'axis',
        formatter: (params: any) => {
          const month = monthNames[params[0].dataIndex];
          const value = params[0].value;
          return `${month}: ₹${value.toLocaleString('en-IN')}`;
        }
      },
      xAxis: {
        type: 'category',
        data: monthNames,
        axisLabel: { 
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Expenses (INR)',
        axisLabel: { 
          formatter: (value: number) => '₹' + value.toLocaleString('en-IN')
        }
      },
      series: [{
        name: 'Total Expenses',
        type: 'bar',
        data: expensesData,
        itemStyle: { 
          color: '#5470C6',
          borderRadius: [5, 5, 0, 0]
        },
        barWidth: '60%',
        label: {
          show: false,
          position: 'top',
          formatter: (params: any) => {
            return params.value > 0 ? '₹' + params.value.toLocaleString('en-IN') : '';
          },
          color: '#333'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }],
      grid: {
        containLabel: true,
        left: '3%',
        right: '3%',
        bottom: '15%',
        top: '20%'
      }
    };

    // 2. Department Attendance Chart
    const pieChartData = Object.entries(this.attendanceByDepartment).map(([name, value]) => ({ name, value }));

    this.pieChartOptions = {
      title: {
        text: `Department-wise Attendance (${this.getCurrentDate()})`,
        left: 'center',
        bottom: 1,
        textStyle: { fontSize: 14 }
      },
      tooltip: { 
        trigger: 'item',
        formatter: (params: any) => {
          return `${params.name}: ${params.value} (${params.percent}%)`;
        }
      },
      series: [{
        name: 'Present Employees',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false  // Hide labels
        },
        emphasis: {
          label: {
            show: false // Also hide on emphasis
          }
        },
        labelLine: {
          show: false // Hide label lines
        },
        data: pieChartData
      }]
    };    
  }

  async downloadPayslip(month: string) {
    const doc = await this.generatePayslipPdf(month);
    doc.save(`Payslip_${month}.pdf`);
  }

  async viewPayslip(month: string) {
    this.selectedMonthForView = month;
    const doc = await this.generatePayslipPdf(month);
    
    // Generate blob URL
    const pdfBlob = doc.output('blob');
    this.pdfBlobUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new tab
    window.open(this.pdfBlobUrl, '_blank');
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString('en-GB');
  }

  private getFormattedDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private async generatePayslipPdf(month: string): Promise<jsPDF> {
    const employee = JSON.parse(localStorage.getItem('fbhgkjwruguegi') || '{}');
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

  private sum(values: number[]): number {
    return values.reduce((acc, val) => acc + (val || 0), 0);
  }

  private numberToWords(num: number): string {
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