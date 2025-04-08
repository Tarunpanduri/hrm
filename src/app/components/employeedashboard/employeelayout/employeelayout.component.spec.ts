import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeelayoutComponent } from './employeelayout.component';

describe('EmployeelayoutComponent', () => {
  let component: EmployeelayoutComponent;
  let fixture: ComponentFixture<EmployeelayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeelayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeelayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
