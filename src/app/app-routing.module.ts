import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EmployeelayoutComponent } from './components/employeedashboard/employeelayout/employeelayout.component';
import { AdminlayoutComponent } from './components/adminlayout/adminlayout.component';
import { DashboardPageComponent } from './components/adminlayout/dashboard-page/dashboard-page.component';
import { LoginComponent } from './components/login/login.component';
import { HgjgComponent } from './components/who_away/hgjg.component';
import { DashboardComponent } from './components/managerdashboard/layout/dashboard/dashboard.component';
import { LayoutComponent } from './components/managerdashboard/layout/layout.component';
import { PeopleComponent } from './components/people/people.component';
import { EmployeedashboardlayoutComponent } from './components/employeedashboard/employeelayout/employeedashboardlayout/employeedashboardlayout.component';
import { ApplicantComponent } from './components/applicant-tracker/applicant/applicant.component';

import { DepartmentGuard } from './auth/department.guard'; // 👈 import your guard
import { MobileNotSupportedComponent } from './mobile-not-supported.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'mobile-not-supported', component: MobileNotSupportedComponent },
  {
    path: 'admin-dashboard',
    component: AdminlayoutComponent,
    canActivate: [DepartmentGuard],
    data: { department: 'Admin' }, // 👈 protect with department
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'calender', component: HgjgComponent },
      { path: 'People', component: PeopleComponent },
      { path: 'Applicant', component: ApplicantComponent },
    ]
  },
  {
    path: 'manager',
    component: LayoutComponent,
    canActivate: [DepartmentGuard],
    data: { department: 'Manager' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'HgjgComponent', component: HgjgComponent },
      { path: 'People', component: PeopleComponent },
      { path: 'Applicant', component: ApplicantComponent },
      { path: 'calender', component: HgjgComponent },

    ]
  },
  {
    path: 'employee',
    component: EmployeelayoutComponent,
    canActivate: [DepartmentGuard],
    data: { department: 'Employee' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeedashboardlayoutComponent },
      { path: 'calender', component: HgjgComponent },
      { path: 'PeopleComponent', component: PeopleComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
