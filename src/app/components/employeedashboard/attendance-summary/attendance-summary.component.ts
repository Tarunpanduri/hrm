import { Component, OnInit } from '@angular/core';
import { getDatabase, ref, get } from '@angular/fire/database';
import { format, parse, differenceInMinutes } from 'date-fns';

@Component({
  selector: 'app-attendance-summary',
  standalone: false,
  templateUrl: './attendance-summary.component.html',
  styleUrl: './attendance-summary.component.css'
})
export class AttendanceSummaryComponent implements OnInit {
  attendanceData: any[] = [];
  userId: string = '';
  db = getDatabase();
  isLoading: boolean = true;

  ngOnInit() {
    const employeeData = JSON.parse(localStorage.getItem('fbhgkjwruguegi') || '{}');
    this.userId = employeeData.emp_id || 'UNKNOWN';
    this.fetchAttendance();
  }

  async fetchAttendance() {
    const today = new Date();
    const last10Days: string[] = [];

    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const formattedDate = format(d, 'yyyy-MM-dd');
      last10Days.push(formattedDate);
    }

    const dataArr: any[] = [];

    for (const date of last10Days) {
      const snapshot = await get(ref(this.db, `attendance/${date}/${this.userId}`));
      const formattedDay = format(new Date(date), 'EEE, dd MMM');
      const todayDateOnly = format(new Date(), 'yyyy-MM-dd');

      if (snapshot.exists()) {
        const data = snapshot.val();

        const checkin = data.checkin || '-';
        const checkout = data.checkout || '-';
        let status = 'Absent';
        let duration = '-';

        if (checkin !== '-' && checkout !== '-') {
          duration = this.calculateDuration(checkin, checkout);
          status = 'Present';
        } else if (checkin !== '-') {
          status = 'Present';
        }

        dataArr.push({
          dateStr: formattedDay,
          checkin,
          checkout,
          duration,
          status
        });
      } else {
        const isPastDate = date < todayDateOnly;
        dataArr.push({
          dateStr: formattedDay,
          checkin: '-',
          checkout: '-',
          duration: '-',
          status: isPastDate ? 'Absent' : 'Pending'
        });
      }
    }

    this.attendanceData = dataArr;
    this.isLoading = false;
  }

  calculateDuration(checkin: string, checkout: string): string {
    try {
      const checkinTime = parse(checkin, 'hh:mm a', new Date());
      const checkoutTime = parse(checkout, 'hh:mm a', new Date());
      const diff = differenceInMinutes(checkoutTime, checkinTime);

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      return `${hours}h ${minutes}m`;
    } catch (err) {
      return '-';
    }
  }
}
