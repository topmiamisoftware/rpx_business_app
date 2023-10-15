import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCreatorComponent } from './event-creator.component';

describe('RewardCreatorComponent', () => {
  let component: EventCreatorComponent;
  let fixture: ComponentFixture<EventCreatorComponent>;
EventCreatorComponent
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
