import { Component, OnInit ,Input} from '@angular/core';
import { Database, ref, onValue,getDatabase, set, get } from '@angular/fire/database';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PayrollData } from '../../modal/payroll.model'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}
@Component({
  selector: 'app-payslip-viewer',
  standalone: false,
  templateUrl: './payslip-viewer.component.html',
  styleUrl: './payslip-viewer.component.css'
})
export class PayslipViewerComponent implements OnInit {
  @Input() cardwidth: string = 'auto'; 
  @Input() sectionwidth: string = 'auto'; 
  @Input() cardheight: string = 'auto';
  empId: string = '';
  payrollData: PayrollData = {};
  selectedMonthForView: string | null = null;
  previewPdfUrl: SafeResourceUrl | null = null;
  isHRorManager = false;

  payslipForm!: FormGroup;
  showPopup = false;

  constructor(private db: Database, private sanitizer: DomSanitizer, private fb: FormBuilder) {}

  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem('fbhgkjwruguegi') || '{}');
    // console.log('PayslipTS : ',userData);
    this.empId = userData?.emp_id || '';
    this.isHRorManager = ['HR', 'MANAGEMENT'].includes(userData?.department);
    this.fetchPayrollData();

    this.payslipForm = this.fb.group({
      month_year: ['', Validators.required],
      basicSalary: [0,Validators.required],
      empId: ['', [Validators.required]], // empId comes from form input
      hra: [0],
      conveyanceAllowance: [0],
      travelReimbursement: [0],
      foodCoupons: [0],
      communicationAllowance: [0],
      netPay: [0],
      pfDeduction: [0],
      professionalTax: [0],
      incomeTax: [0],
      status: ['Paid'],
      paymentDate: [''],
      actualPayableDays: [0],
      totalWorkingDays: [0],
      lossOfPayDays: [0],
      daysPayable: [0],
      bankName: [''],
      bankIfsc: [''],
      bankAccount: ['']
    });
  }

  fetchPayrollData() {
    if (!this.empId) {
      console.error('Employee ID not found');
      return;
    }

    const payrollRef = ref(this.db, `payroll/${this.empId}`);
    onValue(payrollRef, (snapshot) => {
      if (snapshot.exists()) {
        this.payrollData = snapshot.val() as PayrollData;
      } else {
        console.error('No payroll data found');
        this.payrollData = {};
      }
    });
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

  closePreview() {
    this.selectedMonthForView = null;
    this.previewPdfUrl = null;
  }

  private async addImageToPdf(doc: jsPDF, url: string, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            doc.addImage(img, 'PNG', x, y, width, height);
            resolve();
        };
        img.onerror = () => {
            console.error('Failed to load image:', url);
            resolve();
        };
    });
}
  
async generatePayslipPdf(month: string): Promise<jsPDF> {
  const employee = JSON.parse(localStorage.getItem('fbhgkjwruguegi') || '{}');
  console.log('PayslipTS : ',employee);
  const payroll = this.payrollData[month];
  const doc = new jsPDF();

  // Set document properties
  doc.setProperties({ title: `Payslip ${month} - ${employee.name}` });

  // Load and add logo first
  const logoUrl = 'https://i.ibb.co/Z1YVmTKh/CLIM-IT-SOLUTIONS-final.jpg';
  await this.addImageToPdf(doc, logoUrl, 13, 10, 45, 35);

  // Rest of your PDF generation code...
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`PAYSLIP ${month.toUpperCase()}`, 65, 15);

    
    // Move all the PDF generation code outside the onload callback
    // This ensures the function always returns the doc object
    
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
    
    // Horizontal line below name (same style as in image)
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
        payroll.bankName || 'IDFC FIRST', 
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

    // PAN NUMBER SECTION (with same box styling as employee details)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [['Bank Account', 'PAN', 'UAN', 'PF Number']],
      body: [[
        payroll.bankAccount,
        employee.panNumber || 'NA',
        employee.uan || 'NA',
        employee.pfNumber || 'NA'
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

    // SALARY DETAILS HEADER (with matching horizontal line)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SALARY DETAILS', 15, doc.lastAutoTable.finalY + 13);
    
    // Horizontal line below salary details (same style as employee name line)
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
  

  openPopup(): void {
    console.log("Opening popup");
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  async savePayslip() {
    if (this.payslipForm.invalid) {
      console.error('Form is invalid', this.payslipForm.errors);
      alert('Please fill all required fields correctly');
      return;
    }
  
    const formData = this.payslipForm.value;
    
    try {
  
      // Save the payslip data - no need to check if employee exists first
      const payrollRef = ref(this.db, `payroll/${formData.empId}/${formData.month_year}`);
      await set(payrollRef, formData);
      
      alert('Payslip saved successfully!');
      this.closePopup();
      
      // Refresh data if viewing the same employee
      if (formData.empId === this.empId) {
        this.fetchPayrollData();
      }
    } catch (error: any) {
      console.error('Error saving payslip:', error);
      alert(`Error saving payslip: ${error.message || 'Unknown error'}`);
    }
  }
  
 
} 
  