import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkdayUploaderComponent } from './workday-uploader.component';

describe('WorkdayUploaderComponent', () => {
  let component: WorkdayUploaderComponent;
  let fixture: ComponentFixture<WorkdayUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkdayUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkdayUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
