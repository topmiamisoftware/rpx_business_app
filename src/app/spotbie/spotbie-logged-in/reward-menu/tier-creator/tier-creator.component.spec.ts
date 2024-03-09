import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierCreatorComponent } from './tier-creator.component';

describe('TierCreatorComponent', () => {
  let component: TierCreatorComponent;
  let fixture: ComponentFixture<TierCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierCreatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
