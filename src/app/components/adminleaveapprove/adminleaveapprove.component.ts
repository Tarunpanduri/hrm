import { Component, OnInit ,Input } from '@angular/core';
import { Database, ref, get, update } from '@angular/fire/database';

@Component({
  selector: 'app-adminleaveapprove',
  standalone: false,
  templateUrl: './adminleaveapprove.component.html',
  styleUrl: './adminleaveapprove.component.css'
})
export class AdminleaveapproveComponent implements OnInit {
  @Input() cardHeight: string = 'auto'; 
  @Input() tbodyHeight: string = 'auto'; 
  leaveRequests: any[] = [];
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  ngOnInit() {
    this.fetchLeaveRequests();
  }

  async fetchLeaveRequests() {
    try {
      const leaveRef = ref(this.db, 'leaveRequests');
      const leaveSnapshot = await get(leaveRef);

      if (leaveSnapshot.exists()) {
        this.leaveRequests = [];

        leaveSnapshot.forEach((empSnapshot) => {
          const empId = empSnapshot.key;
          empSnapshot.forEach((leave) => {
            const leaveData = leave.val();
            leaveData.id = leave.key; // Store leave ID
            leaveData.empId = empId; // Store Employee ID
            this.leaveRequests.push(leaveData);
          });
        });
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  }

  async updateLeaveStatus(empId: string, leaveId: string, status: string) {
    try {
      const leaveRef = ref(this.db, `leaveRequests/${empId}/${leaveId}`);
      await update(leaveRef, { status });

      if (status === 'Approved') {
        await this.updateEmployeeLeaveBalance(empId);
      }

      alert(`Leave request ${status}`);
      this.fetchLeaveRequests(); // Refresh data
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  }

  async updateEmployeeLeaveBalance(empId: string) {
    try {
      const leaveBalanceRef = ref(this.db, `leaves/${empId}`);
      const leaveBalanceSnapshot = await get(leaveBalanceRef);

      if (leaveBalanceSnapshot.exists()) {
        let remainingLeaves = leaveBalanceSnapshot.val().remainingLeaves;
        remainingLeaves -= 1; // Deduct leave if approved

        await update(leaveBalanceRef, { remainingLeaves });
      }
    } catch (error) {
      console.error('Error updating leave balance:', error);
    }
  }
}