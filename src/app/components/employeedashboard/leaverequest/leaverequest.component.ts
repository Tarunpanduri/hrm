import { Component, OnInit, Renderer2,Input } from '@angular/core';
import { Database, ref, get, set, push, onValue } from '@angular/fire/database';

@Component({
  selector: 'app-leaverequest',
  standalone: false,
  templateUrl: './leaverequest.component.html',
  styleUrl: './leaverequest.component.css'
})
export class LeaverequestComponent implements OnInit {
  @Input() cardheight: string = 'auto'; 
  @Input() cardwidth: string = 'auto'; 
  @Input() cardhehight: string = 'auto'; 



  darkMode: boolean = false;
  leaveRequests: any[] = [];
  searchQuery: string = '';
  sortBy: string = 'date';

  private db: Database;
  employee: any = null;
  empId: string = '';
  remainingLeaves: number = 0;
  totalLeaves: number = 20;
  filterStatus: string = '';

  leaveRequest = {
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending'
  };

  leaveChartOptions: any = {};
  leaveChartUpdate: boolean = false;

  constructor(database: Database, private renderer: Renderer2) {
    this.db = database;
  }

  ngOnInit() {
    const dark = localStorage.getItem('darkMode') === 'true';
    this.darkMode = dark;
    if (dark) {
      this.renderer.addClass(document.body, 'dark-mode');
    }

    this.loadEmployeeData();
    this.listenForLeaveUpdates();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    if (this.darkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  filteredLeaves(): any[] {
    let filtered = this.leaveRequests;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(leave =>
        leave.type?.toLowerCase().includes(query) || leave.status?.toLowerCase().includes(query)
      );
    }

    if (this.filterStatus) {
      filtered = filtered.filter(leave => leave.status === this.filterStatus);
    }

    if (this.sortBy === 'date') {
      filtered = filtered.sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    } else if (this.sortBy === 'status') {
      filtered = filtered.sort((a, b) => a.status.localeCompare(b.status));
    }

    return filtered;
  }

  loadEmployeeData() {
    const storedEmployee = localStorage.getItem('fbhgkjwruguegi');
    if (storedEmployee) {
      this.employee = JSON.parse(storedEmployee);
      this.empId = this.employee.emp_id;
      this.fetchLeaveBalance();
    }
  }

  async fetchLeaveBalance() {
    if (!this.empId) return;
  
    // Fetch joining date from Firebase
    const empRef = ref(this.db, `employees/${this.empId}`);
    const empSnap = await get(empRef);
  
    if (!empSnap.exists()) return;
  
    const joiningDateStr = empSnap.val().joiningDate;
    const joiningDate = new Date(joiningDateStr);
    const today = new Date();
  
    // Calculate full months between joining and today
    const monthsWorked = (today.getFullYear() - joiningDate.getFullYear()) * 12 + (today.getMonth() - joiningDate.getMonth());
  
    // Calculate entitled leaves
    let entitledLeaves = 0;
    for (let i = 1; i <= monthsWorked; i++) {
      entitledLeaves += i <= 3 ? 1 : 3;
    }
  
    this.totalLeaves = entitledLeaves;
  
    // Calculate used leaves
    const leaveRef = ref(this.db, `leaveRequests/${this.empId}`);
    const leaveSnap = await get(leaveRef);
  
    let usedLeaves = 0;
    if (leaveSnap.exists()) {
      leaveSnap.forEach(child => {
        const leave = child.val();
        if (leave.status !== 'Rejected') {
          usedLeaves += parseInt(leave.days || 0);
        }
      });
    }
  
    this.remainingLeaves = this.totalLeaves - usedLeaves;
    if (this.remainingLeaves < 0) this.remainingLeaves = 0;
  
    this.generateChart();
  }

  async submitLeaveRequest() {
    if (!this.leaveRequest.type || !this.leaveRequest.startDate || !this.leaveRequest.endDate || !this.leaveRequest.reason) {
      alert('Please fill all fields!');
      return;
    }

    if (!this.empId) {
      alert('Employee ID not found. Please log in again.');
      return;
    }

    const start = new Date(this.leaveRequest.startDate);
    const end = new Date(this.leaveRequest.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      alert('Invalid leave duration.');
      return;
    }

    if (this.remainingLeaves < days) {
      alert(`Insufficient leave balance. You only have ${this.remainingLeaves} days left.`);
      return;
    }

    try {
      const leaveRef = ref(this.db, `leaveRequests/${this.empId}`);
      const newLeaveRef = push(leaveRef);
      await set(newLeaveRef, {
        ...this.leaveRequest,
        days,
        requestId: newLeaveRef.key
      });

      const leaveBalanceRef = ref(this.db, `leaves/${this.empId}`);
      await set(leaveBalanceRef, {
        totalLeaves: this.totalLeaves,
        remainingLeaves: this.remainingLeaves - days
      });

      alert('Leave Request Submitted!');
      this.leaveRequest = { type: '', startDate: '', endDate: '', reason: '', status: 'Pending' };
      this.fetchLeaveBalance();
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  }

  async revertLeaveDays(empId: string, requestId: string) {
    const requestRef = ref(this.db, `leaveRequests/${empId}/${requestId}`);
    const snapshot = await get(requestRef);
    
    if (snapshot.exists()) {
      const request = snapshot.val();
      const days = parseInt(request.days || 0);

      // Update leave request status to Rejected
      await set(requestRef, {
        ...request,
        status: 'Rejected'
      });

      // Revert remaining leaves
      const balanceRef = ref(this.db, `leaves/${empId}`);
      const balanceSnapshot = await get(balanceRef);
      if (balanceSnapshot.exists()) {
        const balance = balanceSnapshot.val();
        const updatedLeaves = parseInt(balance.remainingLeaves) + days;

        await set(balanceRef, {
          totalLeaves: parseInt(balance.totalLeaves),
          remainingLeaves: updatedLeaves
        });

        alert('Leave Rejected and Days Reverted');
        if (empId === this.empId) {
          this.fetchLeaveBalance(); // refresh chart if it's the current user
        }
      }
    }
  }

  listenForLeaveUpdates() {
    const leaveRef = ref(this.db, `leaveRequests/${this.empId}`);
    onValue(leaveRef, (snapshot) => {
      this.leaveRequests = [];
      snapshot.forEach((childSnapshot) => {
        this.leaveRequests.push(childSnapshot.val());
      });
      this.fetchLeaveBalance();
    });
  }

  filterRequests(status: string) {
    this.filterStatus = status;
  }

  generateChart() {
    this.leaveChartOptions = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: 'bottom',
        bottom: '80'
      },
      series: [
        {
          name: 'Leave Status',
          type: 'pie',
          radius: '50%',
          data: [
            { value: this.totalLeaves - this.remainingLeaves, name: 'Used Leaves' },
            { value: this.remainingLeaves, name: 'Remaining Leaves' }
          ],
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
    this.leaveChartUpdate = true;
  }
}
