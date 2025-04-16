import { Component, OnInit, Input } from '@angular/core';
import { Database, ref, get, update } from '@angular/fire/database';

@Component({
  selector: 'app-adminleaveapprove',
  standalone: false,
  templateUrl: './adminleaveapprove.component.html',
  styleUrl: './adminleaveapprove.component.css'
})
export class AdminleaveapproveComponent implements OnInit {
  @Input() cardHeight: string = 'auto';

  @Input() cardwidth: string = 'auto';
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
  async updateLeaveStatus(empId: string, leaveId: string, newStatus: string) {
    try {
      const leaveRef = ref(this.db, `leaveRequests/${empId}/${leaveId}`);
      const leaveSnapshot = await get(leaveRef);
  
      if (!leaveSnapshot.exists()) {
        alert('Leave request not found');
        return;
      }
  
      const leaveData = leaveSnapshot.val();
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      const oldStatus = leaveData.status;
  
      // Calculate leave days (inclusive)
      const leaveDays = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
  
      // Update leave status
      await update(leaveRef, { status: newStatus });
  
      if (newStatus === 'Rejected') {
        const leaveBalanceRef = ref(this.db, `leaves/${empId}`);
        const balanceSnapshot = await get(leaveBalanceRef);
  
        if (balanceSnapshot.exists()) {
          const currentBalance = balanceSnapshot.val();
          let remainingLeaves = parseInt(currentBalance.remainingLeaves);
  
          // Add back the leave days
          remainingLeaves += leaveDays;
  
          await update(leaveBalanceRef, { remainingLeaves });
        }
      }
  
      alert(`Leave request ${newStatus}`);
      this.fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  }
  
  
  
}
