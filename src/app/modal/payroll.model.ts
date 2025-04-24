export interface Payroll {
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  travelReimbursement: number;
  foodCoupons: number;
  communicationAllowance: number;
  pfDeduction: number;
  professionalTax: number;
  incomeTax: number;
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
