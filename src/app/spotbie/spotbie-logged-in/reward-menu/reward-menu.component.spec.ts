import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardMenuComponent } from './reward-menu.component';

describe('RewardMenuComponent', () => {
  let component: RewardMenuComponent;
  let fixture: ComponentFixture<RewardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
