import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Database, ref, onValue } from '@angular/fire/database';
import { inject } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'app-hgjg',
  standalone: false,
  templateUrl: './hgjg.component.html',
  styleUrls: ['./hgjg.component.css']
})
export class HgjgComponent implements OnInit {
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;
  selectedDateInput: string = '';

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    dateClick: this.onDateClick.bind(this),
    eventClassNames: (arg) => {
      if (arg.event.extendedProps['isLeave']) return ['leave-event'];
      if (arg.event.extendedProps['isHoliday']) return ['holiday-event'];
      return [];
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    datesSet: this.onDatesSet.bind(this) // detect month change
  };

  private db: Database = inject(Database);
  leaveRequests: any[] = [];
  employeeMap: any = {};
  selectedDateLeaves: any[] = [];
  leaveDates: Set<string> = new Set();
  isWeekendClicked: boolean = false;
  currentMonthHolidays: any[] = [];
isLoading: any;

  ngOnInit() {
    const leaveRef = ref(this.db, 'leaveRequests');
    const empRef = ref(this.db, 'employees');
    const currentYear = '2025';

    onValue(empRef, (empSnap) => {
      const empData = empSnap.val();
      if (empData) {
        this.employeeMap = {};
        for (let empId in empData) {
          this.employeeMap[empId] = {
            ...empData[empId],
            employeeId: empId
          };
        }
      }

      onValue(leaveRef, (leaveSnap) => {
        const leaveData = leaveSnap.val();
        const formattedLeaves: any[] = [];
        const calendarEvents: any[] = [];

        for (let empId in leaveData) {
          const employeeLeaves = leaveData[empId];
          for (let leaveId in employeeLeaves) {
            const leave = employeeLeaves[leaveId];
            if (leave.status === 'Approved') {
              const employee = this.employeeMap[empId];
              const leaveEntry = {
                id: leaveId,
                employeeId: empId,
                ...leave,
                employeeDetails: employee || null
              };
              formattedLeaves.push(leaveEntry);

              const leaveStart = new Date(leave.startDate);
              const leaveEnd = leave.endDate ? new Date(leave.endDate) : new Date(leave.startDate);

              for (
                let d = new Date(leaveStart);
                d <= leaveEnd;
                d.setDate(d.getDate() + 1)
              ) {
                const day = d.getDay();
                const isWeekend = day === 0 || day === 6;
                if (!isWeekend) {
                  const dateStr = new Date(d).toISOString().split('T')[0];
                  this.leaveDates.add(dateStr);
                  calendarEvents.push({
                    title: 'Away',
                    start: dateStr,
                    allDay: true,
                    display: 'background',
                    backgroundColor: '#ff0000', // Full red
                    textColor: '#ffffff',       // White title text
                    classNames: ['leave-event'], // Add a custom class
                    extendedProps: {
                      isLeave: true
                    }
                  });
                }
              }
            }
          }
        }

        this.leaveRequests = formattedLeaves;

        // fetch all holiday events for calendar view only
        this.fetchHolidays(currentYear).then((holidayEvents) => {
          this.calendarOptions.events = [...calendarEvents, ...holidayEvents];
        });
      });
    });
  }

  async fetchHolidays(year: string): Promise<any[]> {
    const events: any[] = [];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let month of months) {
      const monthRef = ref(this.db, `${year}/${month}`);
      const snapshot = await new Promise<any>((resolve) => {
        onValue(monthRef, (snap) => resolve(snap.val()), {
          onlyOnce: true,
        });
      });

      if (snapshot) {
        Object.values(snapshot).forEach((holiday: any) => {
          if (holiday?.date && holiday?.event) {
            events.push({
              title: holiday.event,
              start: holiday.date,
              allDay: true,
              backgroundColor: '#28a745',
              extendedProps: {
                isHoliday: true
              }
            });
          }
        });
      }
    }

    return events;
  }

  onDateClick(arg: any) {
    const clickedDate = arg.dateStr;
    const clickedDay = new Date(clickedDate).getDay();
    this.isWeekendClicked = (clickedDay === 0 || clickedDay === 6);

    if (this.isWeekendClicked) {
      this.selectedDateLeaves = [];
      return;
    }

    this.selectedDateLeaves = this.leaveRequests.filter((leave) => {
      return clickedDate >= leave.startDate && clickedDate <= leave.endDate;
    });
  }

  goToSelectedDate() {
    if (!this.selectedDateInput) return;

    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(this.selectedDateInput);
  }

  // 🔥 Fetch monthly holidays when calendar month changes
  async onDatesSet(arg: any) {
  const middleDate = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
  const year = middleDate.getFullYear();
  const monthIndex = middleDate.getMonth(); // 0 = January

  const monthName = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ][monthIndex];

  const monthRef = ref(this.db, `${year}/${monthName}`);
  const snapshot = await new Promise<any>((resolve) => {
    onValue(monthRef, (snap) => resolve(snap.val()), {
      onlyOnce: true
    });
  });

  this.currentMonthHolidays = [];

  if (snapshot) {
    this.currentMonthHolidays = Object.values(snapshot);
  }
}
}