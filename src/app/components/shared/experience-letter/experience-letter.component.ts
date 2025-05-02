import { Component } from '@angular/core';
import { Database, ref, query, orderByChild, equalTo, get } from '@angular/fire/database';
import jsPDF from 'jspdf';


declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}



@Component({
  selector: 'app-experience-letter',
  standalone: false,
  templateUrl: './experience-letter.component.html',
  styleUrl: './experience-letter.component.css'
})
export class ExperienceLetterComponent {
  searchEmpId: string = '';
  employee: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private database: Database) {}

  async searchEmployee() {
    if (!this.searchEmpId.trim()) {
      this.errorMessage = 'Please enter an Employee ID';
      return;
    }

    // Convert search term to uppercase to match your database format (CIS002)
    const searchTerm = this.searchEmpId.trim().toUpperCase();
    
    this.isLoading = true;
    this.errorMessage = '';
    this.employee = null;

    try {
      // Since your emp_id is the same as the key (CIS002), we can query directly
      const employeeRef = ref(this.database, `employees/${searchTerm}`);
      const snapshot = await get(employeeRef);
      
      if (snapshot.exists()) {
        this.employee = snapshot.val();
        
        // Ensure the employee has the required fields
        if (!this.employee.emp_id) {
          this.employee.emp_id = searchTerm; // Fallback to the key if emp_id missing
        }
      } else {
        this.errorMessage = `Employee not found with ID: ${searchTerm}`;
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      this.errorMessage = 'Error fetching employee data';
    } finally {
      this.isLoading = false;
    }
  }

  async generateExperienceLetter() {
    if (!this.employee) {
      this.errorMessage = 'No employee data available';
      return;
    }
  
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // 1. Add letterhead template
    await this.addImageToPdf(doc, '/letterpad.PNG', 0, 0, 210, 297);
  
    // 2. Add content
    doc.setTextColor(0, 0, 0);
    
    // Main Heading
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('EXPERIENCE LETTER', 110, 45, { align: 'center' });
  
    // Sub Heading
    doc.setFontSize(12);
    doc.text('TO WHOMSOEVER IT MAY CONCERN', 105, 55, { align: 'center' });
  
    // Employee Details
    doc.setFontSize(12);
    const lineHeight = 6;
    let yPos = 80;
  
    // Determine gender from name or add gender field to your database
    const gender = this.employee.name.startsWith('Sri Hari') ? 'Male' : 'Male'; // Default to Male if not determinable
  
    // First part of content
    const contentPart1 = [
      `This is to certify that ${gender === 'Male' ? 'Mr.' : 'Ms.'} ${this.employee.name.toUpperCase()}, Employee Code ${this.employee.emp_id} was`,
      `an employee of Clim IT Solutions from ${this.formatDate(this.employee.joiningDate)} till ${this.formatDate(this.getExitDate())}. As per`,
      `our records, ${gender === 'Male' ? 'his' : 'her'} last designation at the time of exit from the company was`
    ];
  
    contentPart1.forEach(line => {
      doc.text(line, 30, yPos);
      yPos += lineHeight;
    });
  
    // Employee Role - Bold and on new line
    yPos += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.employee.role.toUpperCase()}.`, 30, 99);
    yPos += lineHeight;
    
    // Restore normal font
    doc.setFont('helvetica', 'normal');
  
    // Remaining content
    const contentPart2 = [
      '',
      `We wish ${gender === 'Male' ? 'Mr.' : 'Ms.'} ${this.employee.name.toUpperCase()} all the best in ${gender === 'Male' ? 'his' : 'her'} future endeavours.`,
      '',
      'For Clim IT Solutions'
    ];
  
    contentPart2.forEach(line => {
      doc.text(line, 30, yPos);
      yPos += lineHeight;
    });
  
    // 3. Add signature and logo
    const signatureHeight = 15.8;
    const signatureWidth = 34.5;
    const logoHeight = 23.9;
    const logoWidth = 25.4;
  
    await this.addImageToPdf(doc, '/hrsign.PNG', 30, yPos + 10, signatureWidth, signatureHeight);
    // await this.addImageToPdf(doc, '/logo.png', 150, yPos + 5, logoWidth, logoHeight);
  
    // 4. Add signature text and date
    yPos += 30;
    doc.text('Authorized Signature', 30, yPos);
    doc.text(`Date: ${this.formatDate(new Date())}`, 30, yPos + 6);
  
    // Generate PDF
    const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  // Open in new tab
  const newWindow = window.open(blobUrl, '_blank');
  
  // Add download button to the new window
  if (newWindow) {
    newWindow.onload = () => {
      const downloadBtn = newWindow.document.createElement('a');
      downloadBtn.href = blobUrl;
      downloadBtn.download = `Experience_Letter_${this.employee.emp_id}.pdf`;
      downloadBtn.textContent = 'Download Experience Letter';
      downloadBtn.style.position = 'fixed';
      downloadBtn.style.bottom = '20px';
      downloadBtn.style.right = '20px';
      downloadBtn.style.padding = '10px 15px';
      downloadBtn.style.backgroundColor = '#007bff';
      downloadBtn.style.color = 'white';
      downloadBtn.style.borderRadius = '5px';
      downloadBtn.style.textDecoration = 'none';
      downloadBtn.style.zIndex = '1000';
      
      newWindow.document.body.appendChild(downloadBtn);
    };
  }
  }
  
  async generateRelievingLetter() {
    if (!this.employee) {
      this.errorMessage = 'No employee data available';
      return;
    }
  
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // 1. Add letterhead template (same as experience letter)
    await this.addImageToPdf(doc, '/letterpad.PNG', 0, 0, 210, 297);
  
    // 2. Add content
    doc.setTextColor(0, 0, 0);
    
    // Main Heading
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('RELIEVING LETTER', 110, 45, { align: 'center' });
  
    // Sub Heading
    doc.setFontSize(12);
    doc.text('TO WHOMSOEVER IT MAY CONCERN', 105, 55, { align: 'center' });
  
    // Employee Details
    doc.setFontSize(12);
    const lineHeight = 6;
    let yPos = 80;
  
    // First part of content
    const contentPart1 = [
      `This is to certify that ${this.employee.gender === 'Male' ? 'Mr.' : 'Ms.'} ${this.employee.name.toUpperCase()} has been relieved from Clim IT`,
      `Solution. This letter caters to ${this.employee.gender === 'Male' ? 'his' : 'her'} request for issuing the same. ${this.employee.gender === 'Male' ? 'He' : 'She'}, holding the`,
      `position of ${this.employee.role}, has completed all the assigned tasks in time`,
      `and has no pending formalities. ${this.employee.gender === 'Male' ? 'Mr.' : 'Ms.'} ${this.employee.name.toUpperCase()} was employed with us `,
      `from ${this.formatDate(this.employee.joiningDate)} to ${this.formatDate(this.getExitDate())}.`
    ];
  
    contentPart1.forEach(line => {
      doc.text(line, 30, yPos);
      yPos += lineHeight;
    });
  
    // Extra space before next paragraph
    yPos += lineHeight;
  
    // Second paragraph
    const contentPart2 = [
      `${this.employee.gender === 'Male' ? 'Mr.' : 'Ms.'} ${this.employee.name.split(' ')[0]} ${this.employee.name.split(' ').slice(1).join(' ')} has been relieved from all ${this.employee.gender === 'Male' ? 'his' : 'her'}`,
      `duties and responsibilities at the close of office hours of ${this.formatDate(this.getExitDate(), true)}.`
    ];
  
    contentPart2.forEach(line => {
      doc.text(line, 30, yPos);
      yPos += lineHeight;
    });
  
    // Extra space before appreciation paragraph
    yPos += lineHeight;
  
    // Appreciation paragraph
    const contentPart3 = [
      `We appreciate and thank ${this.employee.gender === 'Male' ? 'Mr.' : 'Ms.'} ${this.employee.name.toUpperCase()}'s contribution towards`,
      `company and wish ${this.employee.gender === 'Male' ? 'him' : 'her'} good luck for ${this.employee.gender === 'Male' ? 'his' : 'her'} future career and endeavors.`,
      '',
      'With Best Regards',
      '',
      'For Clim IT Solution'
    ];
  
    contentPart3.forEach(line => {
      doc.text(line, 30, yPos);
      yPos += lineHeight;
    });
  
    // 3. Add signature and logo (same as experience letter)
    const signatureHeight = 15.8;
    const signatureWidth = 34.5;
    const logoHeight = 23.9;
    const logoWidth = 25.4;
  
    await this.addImageToPdf(doc, '/hrsign.PNG', 30, yPos + 10, signatureWidth, signatureHeight);
    // await this.addImageToPdf(doc, '/logo.png', 150, yPos + 5, logoWidth, logoHeight);
  
    // 4. Add signature text and date
    yPos += 30;
    doc.text('Authorized Signature', 30, yPos);
    doc.text(`Date: ${this.formatDate(new Date())}`, 30, yPos + 6);
  
    // Generate PDF and open in new tab
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    const newWindow = window.open(blobUrl, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        const downloadBtn = newWindow.document.createElement('a');
        downloadBtn.href = blobUrl;
        downloadBtn.download = `Relieving_Letter_${this.employee.emp_id}.pdf`;
        downloadBtn.textContent = 'Download Relieving Letter';
        downloadBtn.style.position = 'fixed';
        downloadBtn.style.bottom = '20px';
        downloadBtn.style.right = '20px';
        downloadBtn.style.padding = '10px 15px';
        downloadBtn.style.backgroundColor = '#007bff';
        downloadBtn.style.color = 'white';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.textDecoration = 'none';
        downloadBtn.style.zIndex = '1000';
        
        newWindow.document.body.appendChild(downloadBtn);
      };
    }
  }
  
  // Update formatDate to handle full month display when needed
  private formatDate(dateInput: string | Date, fullMonth = false): string {
    if (!dateInput) return 'N/A';
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      
      if (fullMonth) {
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      } else {
        return `${date.getDate()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      }
    } catch (e) {
      return 'N/A';
    }
  }

  private getExitDate(): Date {
    // Use current date as exit date if not available
    return new Date();
  }
  
  async generateInternshipLetter() {
    if (!this.employee) {
      this.errorMessage = 'No employee data available';
      return;
    }
  
    // Show alert message
    alert('Internship letter generation is currently not available. Please contact HR for internship letters.');
    
    // Alternatively, you could use a more stylish dialog:
    // this.showCustomAlert('Internship Letter', 'Internship letter generation is currently not available. Please contact HR for internship letters.');
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
}