import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';



// ✅ Use correct Firebase imports (NO compat)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { environment } from '../../environment';  

import { LoginComponent } from './components/login/login.component';
import { AdmindashboardComponent } from './components/admindashboard/admindashboard.component';
import { EmployeedashboardComponent } from './components/employeedashboard/employeedashboard.component';
import { CheckinComponent } from './components/checkin/checkin.component';
import { AttendanceChartComponent } from './components/attendeces/chart/attendance-chart/attendance-chart.component';
import { LeaverequestComponent } from './components/employeedashboard/leaverequest/leaverequest.component';
import { AdminleaveapproveComponent } from './components/adminleaveapprove/adminleaveapprove.component';

import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { TasksComponent } from './components/shared/tasks/tasks.component';
import { ManagerdashboardComponent } from './components/managerdashboard/managerdashboard.component';
import { EmployeechartsComponent } from './components/employeecharts/employeecharts.component';
import { PresentEmployeesComponent } from './components/shared/present-employees/present-employees.component';
import { AbsentEmployeesComponent } from './components/shared/absent-employees/absent-employees.component';

import { AdminlayoutComponent } from './components/adminlayout/adminlayout.component';
import { DashboardPageComponent } from './components/adminlayout/dashboard-page/dashboard-page.component';
import { HgjgComponent } from './components/who_away/hgjg.component';
import { LayoutComponent } from './components/managerdashboard/layout/layout.component';
import { DashboardComponent } from './components/managerdashboard/layout/dashboard/dashboard.component';


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
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    MatFormFieldModule,
    MatSelectModule,
    BrowserAnimationsModule,
    FullCalendarModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
