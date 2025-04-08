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


const routes: Routes = [
  { path: '', component: LoginComponent }, 
  {
    path: 'admin-dashboard',
    component: AdminlayoutComponent,
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
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      { path: 'dashboard', component: DashboardComponent },
      { path: 'HgjgComponent', component: HgjgComponent },
      { path: 'People', component: PeopleComponent },
      { path: 'Applicant', component: ApplicantComponent }
    ]
  },
  {
    path: 'employee',
    component: EmployeelayoutComponent,
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
