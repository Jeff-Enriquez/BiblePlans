import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroductionMainComponent } from './introduction-main.component';

describe('IntroductionComponent', () => {
  let component: IntroductionMainComponent;
  let fixture: ComponentFixture<IntroductionMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroductionMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroductionMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
