import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminleaveapproveComponent } from './adminleaveapprove.component';

describe('AdminleaveapproveComponent', () => {
  let component: AdminleaveapproveComponent;
  let fixture: ComponentFixture<AdminleaveapproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminleaveapproveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminleaveapproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
