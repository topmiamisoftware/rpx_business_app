import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardMenuShortComponent } from './reward-menu-short.component';

describe('RewardMenuComponent', () => {
  let component: RewardMenuShortComponent;
  let fixture: ComponentFixture<RewardMenuShortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardMenuShortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardMenuShortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
