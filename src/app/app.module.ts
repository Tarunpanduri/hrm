import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';



// ✅ Use correct Firebase imports (NO compat)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { DepartmentGuard } from './auth/department.guard';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';



import { environment } from '../../environment';  

import { LoginComponent } from './components/login/login.component';
import { AdmindashboardComponent } from './components/admindashboard/admindashboard.component';
import { EmployeedashboardComponent } from './components/employeedashboard/employeedashboard.component';
import { CheckinComponent } from './components/checkin/checkin.component';
import { AttendanceChartComponent } from './components/attendeces/chart/attendance-chart/attendance-chart.component';
import { LeaverequestComponent } from './components/employeedashboard/leaverequest/leaverequest.component';
import { AdminleaveapproveComponent } from './components/adminleaveapprove/adminleaveapprove.component';
import { PeopleComponent } from './components/people/people.component';

import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { TasksComponent } from './components/shared/tasks/tasks.component';
import { ManagerdashboardComponent } from './components/managerdashboard/managerdashboard.component';
import { EmployeechartsComponent } from './components/employeecharts/employeecharts.component';
import { PresentEmployeesComponent } from './components/shared/present-employees/present-employees.component';
import { AbsentEmployeesComponent } from './components/shared/absent-employees/absent-employees.component';
import { PayslipViewerComponent } from './components/payslip-viewer/payslip-viewer.component';

import { AdminlayoutComponent } from './components/adminlayout/adminlayout.component';
import { DashboardPageComponent } from './components/adminlayout/dashboard-page/dashboard-page.component';
import { HgjgComponent } from './components/who_away/hgjg.component';
import { LayoutComponent } from './components/managerdashboard/layout/layout.component';
import { DashboardComponent } from './components/managerdashboard/layout/dashboard/dashboard.component';
import { AttendanceSummaryComponent } from './components/employeedashboard/attendance-summary/attendance-summary.component';
import { EmployeeSidebarComponent } from './components/shared/employee-sidebar/employee-sidebar.component';
import { EmployeelayoutComponent } from './components/employeedashboard/employeelayout/employeelayout.component';
import { EmployeedashboardlayoutComponent } from './components/employeedashboard/employeelayout/employeedashboardlayout/employeedashboardlayout.component';
import { ApplicantComponent } from './components/applicant-tracker/applicant/applicant.component';
import { ManagersidebarComponent } from './components/shared/managersidebar/managersidebar.component';
import { EmployeeReportComponent } from './components/employee-report/employee-report.component';
import { WorkdayUploaderComponent } from './components/workday-uploader/workday-uploader.component';
import { ChartGroupTwoComponent } from './components/chart-group-two/chart-group-two.component';
import { MobileNotSupportedComponent } from './mobile-not-supported.component';
import { ExperienceLetterComponent } from './components/shared/experience-letter/experience-letter.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdmindashboardComponent,
    EmployeedashboardComponent,
    CheckinComponent,
    AttendanceChartComponent,
    LeaverequestComponent,
    AdminleaveapproveComponent,
    SidebarComponent,
    HeaderComponent,
    ManagerdashboardComponent,
    EmployeechartsComponent,
    TasksComponent,
    PresentEmployeesComponent,
    AbsentEmployeesComponent,
    AdminlayoutComponent,
    DashboardPageComponent,
    HgjgComponent,
    LayoutComponent,
    DashboardComponent,
    AttendanceSummaryComponent,
    EmployeeSidebarComponent,
    PeopleComponent,
    EmployeelayoutComponent,
    EmployeedashboardlayoutComponent,
    ApplicantComponent,
    ManagersidebarComponent,
    EmployeeReportComponent,
    WorkdayUploaderComponent,
    PayslipViewerComponent,
    ChartGroupTwoComponent,
    MobileNotSupportedComponent,
    ExperienceLetterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    BrowserAnimationsModule,
    FullCalendarModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
