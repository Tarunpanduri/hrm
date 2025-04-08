import { Component, OnInit, Renderer2 } from '@angular/core';
import { Database, ref, get, set, push, onValue } from '@angular/fire/database';

@Component({
  selector: 'app-leaverequest',
  standalone: false,
  templateUrl: './leaverequest.component.html',
  styleUrl: './leaverequest.component.css'
})
export class LeaverequestComponent implements OnInit {
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

  // ngx-echarts chart options
  leaveChartOptions: any = {};
  leaveChartUpdate: boolean = false;

  constructor(database: Database, private renderer: Renderer2) {
    this.db = database;
  }

  ngOnInit() {
    this.loadEmployeeData();
    this.listenForLeaveUpdates();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
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
    const leaveRef = ref(this.db, `leaves/${this.empId}`);
    const leaveSnapshot = await get(leaveRef);
    if (leaveSnapshot.exists()) {
      this.totalLeaves = leaveSnapshot.val().totalLeaves;
      this.remainingLeaves = leaveSnapshot.val().remainingLeaves;
    }
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

    try {
      const leaveRef = ref(this.db, `leaveRequests/${this.empId}`);
      const newLeaveRef = push(leaveRef);
      await set(newLeaveRef, this.leaveRequest);
      alert('Leave Request Submitted!');
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  }

  listenForLeaveUpdates() {
    const leaveRef = ref(this.db, `leaveRequests/${this.empId}`);
    onValue(leaveRef, (snapshot) => {
      this.leaveRequests = [];
      snapshot.forEach((childSnapshot) => {
        this.leaveRequests.push(childSnapshot.val());
      });
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
        bottom:'80'
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
