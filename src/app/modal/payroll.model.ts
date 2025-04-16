export interface Payroll {
  basicSalary: number;
  bonus: number;
  da: number;
  hra: number;
  conveyanceAllowance: number;
  travelReimbursement: number;
  foodCoupons: number;
  communicationAllowance: number;
  specialAllowance: number;
  pfDeduction: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number; // Optional if you include it
  netPay: number;
  status: string;
  paymentDate: string;

  // Add these new fields for bank details
  bankName: string;
  bankIfsc: string;
  bankAccount: string;
  paymentMode: string;

  // Attendance-related fields
  actualPayableDays: number;
  totalWorkingDays: number;
  lossOfPayDays: number;
  daysPayable: number;
}
export type PayrollData = Record<string, Payroll>;
