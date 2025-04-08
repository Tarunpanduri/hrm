import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';




import { AdmindashboardComponent } from './components/admindashboard/admindashboard.component';
import { AdminlayoutComponent } from './components/adminlayout/adminlayout.component';
import { DashboardPageComponent } from './components/adminlayout/dashboard-page/dashboard-page.component';
import { EmployeedashboardComponent } from './components/employeedashboard/employeedashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ManagerdashboardComponent } from './components/managerdashboard/managerdashboard.component';
import { HgjgComponent } from './components/hgjg/hgjg.component';

const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'employee-dashboard', component: EmployeedashboardComponent },
  { path: 'ManagerdashboardComponent', component: ManagerdashboardComponent },
  {
    path: 'admin-dashboard',
    component: AdminlayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'HgjgComponent', component: HgjgComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
