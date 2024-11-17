import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnityPlanMainComponent } from './unity-plan-main.component';

describe('MainPageComponent', () => {
  let component: UnityPlanMainComponent;
  let fixture: ComponentFixture<UnityPlanMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnityPlanMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnityPlanMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
