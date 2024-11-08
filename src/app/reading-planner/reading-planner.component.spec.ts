import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingPlannerComponent } from './reading-planner.component';

describe('ReadingPlannerComponent', () => {
  let component: ReadingPlannerComponent;
  let fixture: ComponentFixture<ReadingPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingPlannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadingPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
