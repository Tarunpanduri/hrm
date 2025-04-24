import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipViewerComponent } from './payslip-viewer.component';

describe('PayslipViewerComponent', () => {
  let component: PayslipViewerComponent;
  let fixture: ComponentFixture<PayslipViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayslipViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
