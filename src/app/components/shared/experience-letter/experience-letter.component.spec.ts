import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceLetterComponent } from './experience-letter.component';

describe('ExperienceLetterComponent', () => {
  let component: ExperienceLetterComponent;
  let fixture: ComponentFixture<ExperienceLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExperienceLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
