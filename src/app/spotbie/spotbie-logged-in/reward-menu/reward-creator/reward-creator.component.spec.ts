import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardCreatorComponent } from './reward-creator.component';

describe('RewardCreatorComponent', () => {
  let component: RewardCreatorComponent;
  let fixture: ComponentFixture<RewardCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RewardCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
