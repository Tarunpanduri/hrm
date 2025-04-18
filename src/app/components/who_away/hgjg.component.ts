import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg } from '@fullcalendar/core';
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
  private db: Database = inject(Database);

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    dateClick: this.onDateClick.bind(this),
    eventClassNames: (arg) => {
      if (arg.event.extendedProps['isLeave']) return ['leave-event'];
      if (arg.event.extendedProps['isHoliday']) return ['holiday-event'];
      if (arg.event.extendedProps['isBirthday']) return ['birthday-event'];
      return [];
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    datesSet: this.onDatesSet.bind(this)
  };

  leaveRequests: any[] = [];
  employeeMap: any = {};
  selectedDateLeaves: any[] = [];
  selectedDateBirthdays: any[] = [];
  leaveDates: Set<string> = new Set();
  isWeekendClicked: boolean = false;
  currentMonthHolidays: any[] = [];
  birthdayEventMap: { [date: string]: any[] } = {};
  todayDate: string = new Date().toISOString().split('T')[0];

  ngOnInit() {
    const leaveRef = ref(this.db, 'leaveRequests');
    const empRef = ref(this.db, 'employees');
    const currentYear = '2025';

    onValue(empRef, (empSnap) => {
      const empData = empSnap.val();
      if (empData) {
        this.employeeMap = {};
        const birthdayMap: { [date: string]: any[] } = {};

        for (let empId in empData) {
          const employee = empData[empId];
          this.employeeMap[empId] = { ...employee, employeeId: empId };

          const dob = employee.dateofBirth;
          if (dob) {
            const formattedDob = new Date(dob).toISOString().split('T')[0];
            if (!birthdayMap[formattedDob]) {
              birthdayMap[formattedDob] = [];
            }
            birthdayMap[formattedDob].push({
              name: employee.name,
              profileImg: employee.profileImg || 'https://via.placeholder.com/40'
            });
          }
        }

        this.birthdayEventMap = birthdayMap;

        const birthdayEvents = Object.entries(birthdayMap).map(([date, list]) => ({
          title: '🎂',
          start: date,
          allDay: true,
          display: 'auto',
          classNames: ['birthday-event'],
          extendedProps: {
            isBirthday: true,
            birthdayList: list
          }
        }));

        onValue(leaveRef, (leaveSnap) => {
          const leaveData = leaveSnap.val();
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
                this.leaveRequests.push(leaveEntry);

                const leaveStart = new Date(leave.startDate);
                const leaveEnd = leave.endDate ? new Date(leave.endDate) : leaveStart;

                for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
                  const day = d.getDay();
                  if (day !== 0 && day !== 6) {
                    const dateStr = new Date(d).toISOString().split('T')[0];
                    this.leaveDates.add(dateStr);
                    calendarEvents.push({
                      title: 'Away',
                      start: dateStr,
                      allDay: true,
                      backgroundColor: '#ff0000',
                      textColor: '#ffffff',
                      classNames: ['leave-event'],
                      extendedProps: { isLeave: true }
                    });
                  }
                }
              }
            }
          }

          this.fetchHolidays(currentYear).then((holidayEvents) => {
            this.calendarOptions.events = [
              ...calendarEvents,
              ...holidayEvents,
              ...birthdayEvents
            ];

            // 🔥 Default load today's data after events setup
            this.selectDateDetails(this.todayDate);
          });
        });
      }
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
        onValue(monthRef, (snap) => resolve(snap.val()), { onlyOnce: true });
      });

      if (snapshot) {
        Object.values(snapshot).forEach((holiday: any) => {
          if (holiday?.date && holiday?.event) {
            events.push({
              title: holiday.event,
              start: holiday.date,
              allDay: true,
              backgroundColor: '#28a745',
              extendedProps: { isHoliday: true }
            });
          }
        });
      }
    }

    return events;
  }

  onDateClick(arg: any) {
    const clickedDate = arg.dateStr;
    this.selectDateDetails(clickedDate);
  }

  selectDateDetails(dateStr: string) {
    const clickedDay = new Date(dateStr).getDay();
    this.isWeekendClicked = (clickedDay === 0 || clickedDay === 6);

    if (this.isWeekendClicked) {
      this.selectedDateLeaves = [];
      this.selectedDateBirthdays = [];
      return;
    }

    this.selectedDateLeaves = this.leaveRequests.filter((leave) => {
      return dateStr >= leave.startDate && dateStr <= leave.endDate;
    });

    this.selectedDateBirthdays = this.birthdayEventMap[dateStr] || [];
  }

  async onDatesSet(arg: any) {
    const middleDate = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
    const year = middleDate.getFullYear();
    const monthIndex = middleDate.getMonth();

    const monthName = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][monthIndex];

    const monthRef = ref(this.db, `${year}/${monthName}`);
    const snapshot = await new Promise<any>((resolve) => {
      onValue(monthRef, (snap) => resolve(snap.val()), { onlyOnce: true });
    });

    this.currentMonthHolidays = snapshot ? Object.values(snapshot) : [];

    // 👇 Detect if "Today" button was clicked
    const calendarApi = this.calendarComponent.getApi();
    const currentDate = calendarApi.getDate().toISOString().split('T')[0];

    if (currentDate === this.todayDate) {
      this.selectDateDetails(this.todayDate);
    }
  }
}
