import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-workday-uploader',
  standalone: false,
  templateUrl: './workday-uploader.component.html',
  styleUrl: './workday-uploader.component.css'
})
export class WorkdayUploaderComponent {

  form: FormGroup;
  excelFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      sheetName: [''],
      date: [''],
      morning: [''],
      afternoon: [''],
      status: ['']
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) this.excelFile = file;
  }

  estimateRowHeight(text: string, columnWidth: number): number {
    const avgCharPerLine = columnWidth * 1.2; // assuming ~1.2 chars per unit width
    const lines = Math.ceil(text.length / avgCharPerLine);
    const lineHeight = 15; // default line height in points
    return lines * lineHeight;
  }

  async updateExcel() {
    if (!this.excelFile) {
      alert('Please upload an Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);

      const sheetName = this.form.value.sheetName;
      const newRowData = [
        this.form.value.date,
        this.form.value.morning,
        this.form.value.afternoon,
        this.form.value.status
      ];

      let worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        worksheet = workbook.addWorksheet(sheetName);
        worksheet.getRow(2).values = ['Date', 'MORNING', 'AFTERNOON', 'Status'];
        worksheet.columns = [
          { width: 20 },
          { width: 30 },
          { width: 30 },
          { width: 20 }
        ];
      }

      const insertRowIndex = worksheet.lastRow ? worksheet.lastRow.number + 1 : 3;
      const newRow = worksheet.insertRow(insertRowIndex, newRowData);

      let maxHeight = 15;
      newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const content = cell.value?.toString() || '';
        cell.alignment = { wrapText: true, vertical: 'middle' };

        const colWidth = worksheet.getColumn(colNumber).width ?? 20;
        const estHeight = this.estimateRowHeight(content, colWidth);
        maxHeight = Math.max(maxHeight, estHeight);
      });

      newRow.height = maxHeight;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, 'Updated_Workday_Report.xlsx');
    };

    reader.readAsArrayBuffer(this.excelFile);
  }
}
