import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HgjgComponent } from './hgjg.component';

describe('HgjgComponent', () => {
  let component: HgjgComponent;
  let fixture: ComponentFixture<HgjgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HgjgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HgjgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
