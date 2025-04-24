import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedashboardlayoutComponent } from './employeedashboardlayout.component';

describe('EmployeedashboardlayoutComponent', () => {
  let component: EmployeedashboardlayoutComponent;
  let fixture: ComponentFixture<EmployeedashboardlayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeedashboardlayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeedashboardlayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
