import { Component, OnInit, OnDestroy,Input } from '@angular/core';
import { Database, ref, onValue, set, update } from '@angular/fire/database';
import { AttendanceService } from '../../services/attendance/attendance.service';

@Component({
  selector: 'app-checkin',
  standalone: false,
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckinComponent implements OnInit, OnDestroy {
  @Input() cardwidth: string = 'auto'; 

  currentTime: string = '';
  currentDate: string = '';
  checkinTime: string | null = null;
  checkoutTime: string | null = null;
  emp_Id: string | null = null;
  weeklyWorkedHours: number = 0;
  fixedWeeklyHours: number = 45;
  todayWorkedHours: string = '0 hrs 0 min';
  todayWorkedInterval: any = null;

  constructor(
    private attendanceService: AttendanceService,
    private db: Database
  ) {}

  ngOnInit(): void {
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);

    const storedEmployee = localStorage.getItem('fbhgkjwruguegi');

    if (storedEmployee) {
      const employeeData = JSON.parse(storedEmployee);
      this.emp_Id = employeeData.emp_id;

      this.loadAttendanceData();
      this.loadWeeklyAttendanceData();
    }
  }

  ngOnDestroy(): void {
    if (this.todayWorkedInterval) {
      clearInterval(this.todayWorkedInterval);
    }
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    this.currentDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  loadAttendanceData() {
    if (!this.emp_Id) return;

    const today = new Date().toISOString().split('T')[0];
    const attendanceRef = ref(this.db, `attendance/${today}/${this.emp_Id}`);

    onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.checkinTime = data.checkin || null;
        this.checkoutTime = data.checkout || null;

        if (this.checkinTime) {
          if (this.checkoutTime) {
            this.calculateFinalWorkedHours();
          } else {
            this.startLiveTodayWorkedUpdate();
          }
        }
      }
    });
  }

  async loadWeeklyAttendanceData() {
    if (!this.emp_Id) return;
  
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
  
    let totalWorkedHours = 0;
    const promises = [];
  
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
  
      const attendanceRef = ref(this.db, `attendance/${dateString}/${this.emp_Id}`);
  
      promises.push(
        new Promise<void>((resolve) => {
          onValue(attendanceRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
  
              if (data.checkin && data.checkout) {
                const checkinTime = this.parseTimeString(data.checkin, date);
                const checkoutTime = this.parseTimeString(data.checkout, date);
  
                if (checkinTime && checkoutTime && checkoutTime > checkinTime) {
                  totalWorkedHours += (checkoutTime.getTime() - checkinTime.getTime()) / (1000 * 60 * 60);
                }
              }
            }
            resolve();
          }, { onlyOnce: true });
        })
      );
    }
  
    await Promise.all(promises);
  
    // Convert total worked hours to minutes
    const totalWorkedMinutes = totalWorkedHours * 60;
  
    // Round down to nearest 0.5 hour increment
    const roundedHours = Math.floor(totalWorkedMinutes / 30) * 0.5;
  
    // Set the rounded value
    this.weeklyWorkedHours = roundedHours;
    console.log("Total worked hours:", this.weeklyWorkedHours);
  }
  



  parseTimeString(timeString: string, date: Date): Date | null {
    const match = timeString.match(/(\d{1,2}):(\d{2}) ?(AM|PM)/i); // added `i` flag
    if (!match) return null;
  
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase(); // ensure uppercase
  
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  
    const parsedDate = new Date(date);
    parsedDate.setHours(hours, minutes, 0, 0);
  
    return parsedDate;
  }
  

  startLiveTodayWorkedUpdate() {
    if (this.todayWorkedInterval) {
      clearInterval(this.todayWorkedInterval);
    }

    this.calculateTodayWorkedHours();
    this.todayWorkedInterval = setInterval(() => this.calculateTodayWorkedHours(), 60000);
  }

  calculateTodayWorkedHours() {
    if (!this.checkinTime) {
      this.todayWorkedHours = '0 hrs 0 min';
      return;
    }

    const checkinTime = this.parseTimeString(this.checkinTime, new Date());
    if (!checkinTime) {
      this.todayWorkedHours = '0 hrs 0 min';
      return;
    }

    const currentTime = new Date();
    let diffMinutes = Math.floor((currentTime.getTime() - checkinTime.getTime()) / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    this.todayWorkedHours = `${hours} hrs ${minutes} min`;
  }

  calculateFinalWorkedHours() {
    if (!this.checkinTime || !this.checkoutTime) return;

    const checkinTime = this.parseTimeString(this.checkinTime, new Date());
    const checkoutTime = this.parseTimeString(this.checkoutTime, new Date());

    if (!checkinTime || !checkoutTime) return;

    let diffMinutes = Math.floor((checkoutTime.getTime() - checkinTime.getTime()) / (1000 * 60));
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    this.todayWorkedHours = `${hours} hrs ${minutes} min`;
    clearInterval(this.todayWorkedInterval);
  }

  checkIn() {
    if (!this.emp_Id) return;

    const today = new Date().toISOString().split('T')[0];
    const checkinTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    set(ref(this.db, `attendance/${today}/${this.emp_Id}`), {
      checkin: checkinTime,
      status: "Present"
    })
      .then(() => {
        this.checkinTime = checkinTime;
        this.startLiveTodayWorkedUpdate();
      })
      .catch(error => console.error('Check-in error:', error));
  }

  checkOut() {
    if (!this.emp_Id) return;
  
    const today = new Date().toISOString().split('T')[0];
    const checkoutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  
    const attendanceRef = ref(this.db, `attendance/${today}/${this.emp_Id}`);
  
    update(attendanceRef, { 
      checkout: checkoutTime,
      status: "Present"
    })
    .then(() => {
      this.checkoutTime = checkoutTime;
      this.calculateFinalWorkedHours();
    })
    .catch(error => console.error('Check-out error:', error));
  }
}




// fbhgkjwruguegi