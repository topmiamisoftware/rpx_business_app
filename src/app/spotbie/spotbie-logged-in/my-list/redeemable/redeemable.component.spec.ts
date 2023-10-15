import { ComponentFixture, TestBed } from '@angular/core/testing';

import {RedeemableComponent} from './redeemable.component';

describe('RedeemableComponent', () => {
  let component: RedeemableComponent;
  let fixture: ComponentFixture<RedeemableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedeemableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
