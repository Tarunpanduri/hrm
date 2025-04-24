import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { Database, ref, get, child } from '@angular/fire/database';

@Component({
  selector: 'app-employeecharts',
  standalone: false,
  templateUrl: './employeecharts.component.html',
  styleUrls: ['./employeecharts.component.css']
})
export class EmployeechartsComponent implements OnInit {
  attendanceChartOption!: EChartsOption;
  departmentChartOption!: EChartsOption;
  isLoading = true;

  constructor(private db: Database) {}

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData() {
    const attendanceRef = ref(this.db);
    const attendanceSnap = await get(child(attendanceRef, 'attendance'));
    const departmentSnap = await get(child(attendanceRef, 'climit/departments'));

    const attendanceData = attendanceSnap.exists() ? attendanceSnap.val() : {};
    const departments = departmentSnap.exists() ? departmentSnap.val() : {};

    this.prepareAttendanceChart(attendanceData);
    this.prepareDepartmentChart(departments);

    this.isLoading = false;
  }

  prepareAttendanceChart(data: any): void {
    const xAxisData: string[] = [];
    const workedHoursData: number[] = [];
    const goalLineData: number[] = [];

    Object.keys(data).forEach((date) => {
      xAxisData.push(date);

      const empRecords = data[date];
      let totalMinutes = 0;
      let presentCount = 0;

      for (let empId in empRecords) {
        const record = empRecords[empId];
        if (record.status === 'Present' && record.checkin && record.checkout) {
          const checkin = this.parseTime(record.checkin);
          const checkout = this.parseTime(record.checkout);

          const diffMs = checkout.getTime() - checkin.getTime();
          totalMinutes += diffMs / (1000 * 60);
          presentCount++;
        }
      }

      const averageHours = presentCount > 0 ? +(totalMinutes / 60 / presentCount).toFixed(2) : 0;
      workedHoursData.push(averageHours);
      goalLineData.push(9); // Always push goal of 9 hours
    });

    this.attendanceChartOption = {
      title: {
        text: 'Employee Daily Average Hours (Goal vs Actual)',
        left: 'center',
        bottom: 0,
        textStyle: {
          fontSize: 13
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Performance', 'Goal (9 hrs)'],
        bottom: 20
      },
      xAxis: {
        type: 'category',
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        name: 'Hours Worked'
      },
      series: [
        {
          name: 'Performance',
          data: workedHoursData,
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#4facfe' },
                { offset: 1, color: '#00f2fe' }
              ]
            }
          },
          lineStyle: {
            color: '#007bff'
          },
          symbol: 'circle',
          symbolSize: 8
        },
        {
          name: 'Goal (9 hrs)',
          data: goalLineData,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#ff5e5e',
            type: 'dashed'
          },
          symbol: 'none'
        }
      ]
    };
  }

  parseTime(timeStr: string): Date {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return new Date(now);
  }

  prepareDepartmentChart(data: any): void {
    const pieData = Object.keys(data).map(key => ({
      name: data[key].name,
      value: Number(data[key].crew || 0)
    }));

    this.departmentChartOption = {
      title: {
        text: 'Departments',
        left: 'center',
        bottom: 0,
        textStyle: {
          fontSize: 13
        }
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: 'Departments',
          type: 'pie',
          radius: '50%',
          data: pieData,
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
  }
}
