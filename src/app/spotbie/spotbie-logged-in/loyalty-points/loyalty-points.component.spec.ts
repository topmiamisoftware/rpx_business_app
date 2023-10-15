import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyPointsComponent } from './loyalty-points.component';

describe('LoyaltyPointsComponent', () => {
  let component: LoyaltyPointsComponent;
  let fixture: ComponentFixture<LoyaltyPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoyaltyPointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoyaltyPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
