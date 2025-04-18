import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartGroupTwoComponent } from './chart-group-two.component';

describe('ChartGroupTwoComponent', () => {
  let component: ChartGroupTwoComponent;
  let fixture: ComponentFixture<ChartGroupTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChartGroupTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartGroupTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
