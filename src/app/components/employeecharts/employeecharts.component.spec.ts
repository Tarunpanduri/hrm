import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeechartsComponent } from './employeecharts.component';

describe('EmployeechartsComponent', () => {
  let component: EmployeechartsComponent;
  let fixture: ComponentFixture<EmployeechartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeechartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeechartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
